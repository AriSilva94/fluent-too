const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const mailpitUrl = process.env.MAILPIT_URL ?? "http://localhost:8025";
const email = `smoke-${Date.now()}@example.com`;
const password = `Smoke${Date.now()}a`;
const nextPassword = `${password}Z`;

async function request(path, options = {}) {
  const response = await fetch(`${frontendUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const setCookie = response.headers.getSetCookie?.() ?? [];
  const body = await readBody(response);
  return { response, body, setCookie };
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function waitForMail(subjectPart) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const response = await fetch(`${mailpitUrl}/api/v1/messages`);
    const body = await response.json();
    const message = body.messages?.find((item) => item.To?.some((to) => to.Address === email) && item.Subject?.includes(subjectPart));
    if (message) {
      const detail = await fetch(`${mailpitUrl}/api/v1/message/${message.ID}`);
      return detail.json();
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Email nao encontrado: ${subjectPart}`);
}

function collectCookie(previous, setCookie) {
  const values = new Map(previous.split(";").filter(Boolean).map((entry) => {
    const [name, ...rest] = entry.trim().split("=");
    return [name, rest.join("=")];
  }));
  for (const cookie of setCookie) {
    const [pair] = cookie.split(";");
    const [name, ...rest] = pair.split("=");
    values.set(name, rest.join("="));
  }
  return Array.from(values.entries()).map(([name, value]) => `${name}=${value}`).join("; ");
}

function findUrl(message) {
  const html = message.HTML || message.Text || "";
  const match = html.match(/https?:\/\/[^\s"'<>]+/);
  if (!match) throw new Error("Link nao encontrado no email");
  return match[0].replace(/&amp;/g, "&");
}

const register = await request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email, password, passwordConfirmation: password }),
});
if (register.response.status !== 200) throw new Error(`Cadastro falhou: ${JSON.stringify(register.body)}`);

const blockedLogin = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
if (blockedLogin.response.status !== 403) throw new Error("Login antes da confirmacao deveria falhar");

const confirmation = await waitForMail("Confirme");
await fetch(findUrl(confirmation), { redirect: "manual" });

let cookie = "";
const login = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
if (login.response.status !== 200) throw new Error(`Login falhou: ${JSON.stringify(login.body)}`);
cookie = collectCookie(cookie, login.setCookie);

const forgot = await request("/api/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email }),
});
if (forgot.response.status !== 200) throw new Error("Recuperacao falhou");

const resetMail = await waitForMail("Redefini");
const resetUrl = new URL(findUrl(resetMail));
const code = resetUrl.searchParams.get("code") ?? resetUrl.searchParams.get("token");
if (!code) throw new Error("Codigo de reset ausente");

const reset = await request("/api/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({ code, password: nextPassword, passwordConfirmation: nextPassword }),
});
if (reset.response.status !== 200) throw new Error(`Reset falhou: ${JSON.stringify(reset.body)}`);
cookie = collectCookie(cookie, reset.setCookie);

const session = await request("/api/auth/session", { headers: { Cookie: cookie } });
if (session.response.status !== 200 || !session.body.ok) throw new Error("Sessao nao autenticada apos reset");

const logout = await request("/api/auth/logout", { method: "POST", headers: { Cookie: cookie } });
if (logout.response.status !== 200) throw new Error("Logout falhou");

const dashboard = await fetch(`${frontendUrl}/pt-br/dashboard`, { redirect: "manual" });
if (![302, 307, 308].includes(dashboard.status)) throw new Error("Dashboard sem sessao deveria redirecionar");

console.log("Smoke auth concluido");
