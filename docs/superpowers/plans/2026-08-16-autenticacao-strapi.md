# Autenticação completa com Strapi - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** Entregar autenticação completa e segura no Next.js usando Strapi 5.52, PostgreSQL, SMTP e Google OAuth, pronta para execução local e publicação separada no Dokploy.

**Arquitetura:** O Next.js atuará como BFF e será a única superfície de autenticação usada pelo navegador. O Strapi continuará como autoridade de usuários e sessões, enquanto o BFF armazenará os tokens rotativos em cookies `HttpOnly` e protegerá as rotas localizadas. As configurações do Users & Permissions serão aplicadas de forma idempotente e os dois serviços terão imagens Docker independentes.

**Stack:** Next.js 16, React 19, TypeScript 5, Vitest, Testing Library, Strapi 5.52, Users & Permissions, Nodemailer, PostgreSQL 16 e Docker.

---

## Mapa de arquivos

### Frontend `fluent-too`

- Criar `vitest.config.ts` para a configuração de testes.
- Criar `test/setup.ts` para matchers DOM.
- Criar `lib/auth/contracts.ts` para contratos públicos e internos.
- Criar `lib/auth/validation.ts` para validação de entradas.
- Criar `lib/auth/redirect.ts` para destinos internos seguros.
- Criar `lib/auth/errors.ts` para normalização de erros do Strapi.
- Criar `lib/auth/cookies.ts` para o ciclo de vida dos cookies.
- Criar `lib/auth/strapi-client.ts` para chamadas HTTP exclusivas do servidor.
- Criar `lib/auth/session.ts` para validação e rotação de sessão.
- Criar `lib/auth/request.ts` para origem e leitura limitada de JSON.
- Criar `app/api/auth/**/route.ts` para os endpoints BFF.
- Criar `components/auth/AuthForm.tsx` para o formulário reutilizável.
- Criar `components/auth/AuthStatus.tsx` para estado de sessão no cabeçalho.
- Criar páginas localizadas de cadastro, confirmação e senhas em `app/[locale]`.
- Criar `app/[locale]/dashboard/security/page.tsx` para alteração de senha.
- Modificar `app/[locale]/login/LoginForm.tsx` para o fluxo real.
- Modificar `components/home/Header.tsx` e `MobileMenu.tsx` para entrada e saída.
- Modificar `app/[locale]/dashboard/page.tsx` para consumir o usuário real.
- Modificar `app/[locale]/admin/page.tsx` para não expor um painel falso.
- Modificar `lib/getDictionary.ts` e `messages/*.json` para os novos textos.
- Modificar `proxy.ts` para localização e proteção de rotas.
- Modificar `next.config.ts` para saída standalone.
- Criar `Dockerfile`, `.dockerignore` e `.env.example`.

### Backend `fluent-too-api`

- Criar `src/auth/config.ts` para gerar configurações reproduzíveis.
- Criar `src/auth/config.test.ts` para validar os contratos de ambiente.
- Modificar `src/index.ts` para aplicar configurações idempotentes no bootstrap.
- Modificar `config/plugins.ts` para sessão renovável e SMTP.
- Modificar `config/server.ts` para URL pública e proxy reverso.
- Modificar `config/middlewares.ts` para CORS restrito.
- Modificar `config/database.ts` somente se os testes revelarem lacuna no PostgreSQL.
- Modificar `.env.example` com todas as variáveis necessárias.
- Adicionar o provider Nodemailer ao `package.json` e lockfile.
- Criar `Dockerfile`, `.dockerignore` e `public/uploads/.gitkeep`.

### Raiz comum `fluent-too-project`

- Criar `compose.yaml` para frontend, backend, PostgreSQL e Mailpit locais.
- Criar `.env.example` para o Compose.
- Criar `README.md` com inicialização e configuração de Google, SMTP e Dokploy.

## Tarefa 1: Base de testes do frontend

**Arquivos:**
- Modificar: `package.json`
- Modificar: `package-lock.json`
- Criar: `vitest.config.ts`
- Criar: `test/setup.ts`
- Criar: `lib/auth/validation.test.ts`

- [ ] **Passo 1: instalar o runner e escrever o primeiro teste que falha**

Executar:

```powershell
npm install --save-dev vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Adicionar scripts `test` e `test:watch` ao `package.json`. Criar `vitest.config.ts` com ambiente `jsdom`, alias `@` apontando para a raiz e setup em `test/setup.ts`. Criar o teste:

```ts
import { describe, expect, it } from "vitest";
import { validateLogin } from "./validation";

describe("validateLogin", () => {
  it("normaliza o e-mail antes de aceitar as credenciais", () => {
    expect(validateLogin({ email: " Aluno@Example.com ", password: "secret123" })).toEqual({
      ok: true,
      data: { email: "aluno@example.com", password: "secret123" },
    });
  });
});
```

- [ ] **Passo 2: confirmar a falha correta**

Executar `npm test -- lib/auth/validation.test.ts`. Esperado: falha porque `lib/auth/validation.ts` ainda não existe.

- [ ] **Passo 3: criar a menor implementação**

Criar `lib/auth/validation.ts` com `validateLogin`, retorno discriminado e normalização por `trim().toLowerCase()`. Não adicionar ainda regras de cadastro ou senha.

- [ ] **Passo 4: confirmar o teste verde e a configuração**

Executar `npm test -- lib/auth/validation.test.ts` e `npm run lint`. Esperado: ambos encerram com código zero.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add package.json package-lock.json vitest.config.ts test/setup.ts lib/auth/validation.ts lib/auth/validation.test.ts
git commit -m "test: configura base de autenticacao"
```

## Tarefa 2: Contratos, validação e erros

**Arquivos:**
- Criar: `lib/auth/contracts.ts`
- Modificar: `lib/auth/validation.ts`
- Modificar: `lib/auth/validation.test.ts`
- Criar: `lib/auth/redirect.ts`
- Criar: `lib/auth/redirect.test.ts`
- Criar: `lib/auth/errors.ts`
- Criar: `lib/auth/errors.test.ts`

- [ ] **Passo 1: escrever testes para todas as fronteiras públicas**

Cobrir individualmente:

```ts
expect(validateRegister({ email: "bad", password: "123", passwordConfirmation: "456" })).toEqual({
  ok: false,
  fieldErrors: {
    email: "INVALID_EMAIL",
    password: "WEAK_PASSWORD",
    passwordConfirmation: "PASSWORDS_DO_NOT_MATCH",
  },
});

expect(safeRedirect("https://evil.example", "/pt-br/dashboard")).toBe("/pt-br/dashboard");
expect(safeRedirect("//evil.example", "/pt-br/dashboard")).toBe("/pt-br/dashboard");
expect(safeRedirect("/pt-br/quizzes", "/pt-br/dashboard")).toBe("/pt-br/quizzes");

expect(mapStrapiError(400, "Invalid identifier or password")).toBe("INVALID_CREDENTIALS");
expect(mapStrapiError(400, "Your account email is not confirmed")).toBe("EMAIL_NOT_CONFIRMED");
expect(mapStrapiError(429, "Too Many Requests")).toBe("RATE_LIMITED");
expect(mapStrapiError(503, "unknown")).toBe("SERVICE_UNAVAILABLE");
```

- [ ] **Passo 2: confirmar que os testes falham por símbolos ausentes**

Executar `npm test -- lib/auth/validation.test.ts lib/auth/redirect.test.ts lib/auth/errors.test.ts`. Esperado: falhas por exports ainda não implementados.

- [ ] **Passo 3: implementar contratos completos**

`contracts.ts` definirá `AuthUser`, `AuthTokens`, `AuthErrorCode`, `AuthResponse<T>` e os payloads de login, cadastro, redefinição e alteração de senha. A senha deverá ter entre 8 e 72 bytes UTF-8. `redirect.ts` aceitará apenas um caminho local com uma única barra inicial. `errors.ts` mapeará mensagens conhecidas sem devolvê-las ao navegador.

- [ ] **Passo 4: executar testes, lint e TypeScript**

Executar:

```powershell
npm test -- lib/auth/validation.test.ts lib/auth/redirect.test.ts lib/auth/errors.test.ts
npx tsc --noEmit
npm run lint
```

Esperado: todos passam sem warnings novos.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add lib/auth
git commit -m "feat: define contratos de autenticacao"
```

## Tarefa 3: Cookies, proteção de origem e cliente Strapi

**Arquivos:**
- Criar: `lib/auth/cookies.ts`
- Criar: `lib/auth/cookies.test.ts`
- Criar: `lib/auth/request.ts`
- Criar: `lib/auth/request.test.ts`
- Criar: `lib/auth/strapi-client.ts`
- Criar: `lib/auth/strapi-client.test.ts`

- [ ] **Passo 1: escrever testes de segurança antes da implementação**

Os testes devem afirmar:

```ts
expect(buildAuthCookieOptions(600, true)).toMatchObject({
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  path: "/",
  maxAge: 600,
});

expect(isTrustedOrigin("https://app.example.com", "https://app.example.com")).toBe(true);
expect(isTrustedOrigin("https://evil.example", "https://app.example.com")).toBe(false);
```

O cliente Strapi será testado com `fetch` injetável para confirmar URL interna, `AbortSignal.timeout`, `Content-Type`, bearer token e normalização de respostas não JSON.

- [ ] **Passo 2: observar as falhas esperadas**

Executar `npm test -- lib/auth/cookies.test.ts lib/auth/request.test.ts lib/auth/strapi-client.test.ts`. Esperado: módulos ausentes.

- [ ] **Passo 3: implementar módulos isolados**

`cookies.ts` exportará constantes de nomes, opções e funções que operam sobre uma interface mínima compatível com `RequestCookies` e `ResponseCookies`. `request.ts` rejeitará origem inválida e corpos acima de 16 KiB. `strapi-client.ts` terá métodos `login`, `register`, `me`, `refresh`, `logout`, `forgotPassword`, `resetPassword`, `resendConfirmation`, `changePassword` e `googleCallback`.

Todas as respostas do cliente seguirão `AuthResponse<T>`. O módulo começará com `import "server-only"` e lerá `STRAPI_INTERNAL_URL` somente no servidor.

- [ ] **Passo 4: validar o conjunto**

Executar os três testes, `npx tsc --noEmit` e `npm run lint`. Esperado: código zero.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add lib/auth
git commit -m "feat: adiciona cliente seguro do Strapi"
```

## Tarefa 4: Serviço de sessão rotativa

**Arquivos:**
- Criar: `lib/auth/session.ts`
- Criar: `lib/auth/session.test.ts`

- [ ] **Passo 1: escrever testes de access token, rotação única e limpeza**

Usar dependências injetadas e afirmar três cenários:

```ts
expect(await resolveSession(validCookies, client)).toEqual({ status: "authenticated", user });
expect(client.refresh).not.toHaveBeenCalled();

expect(await resolveSession(expiredAccessCookies, client)).toEqual({
  status: "refreshed",
  user,
  tokens: rotatedTokens,
});
expect(client.refresh).toHaveBeenCalledTimes(1);

expect(await resolveSession(invalidCookies, client)).toEqual({ status: "anonymous", clear: true });
expect(client.refresh).toHaveBeenCalledTimes(1);
```

- [ ] **Passo 2: executar e confirmar falha por implementação ausente**

Executar `npm test -- lib/auth/session.test.ts`. Esperado: `resolveSession` ausente.

- [ ] **Passo 3: implementar a máquina de estados da sessão**

`resolveSession` tentará `me(accessToken)`, rotacionará uma única vez após resposta não autorizada, validará o usuário com o novo access token e nunca repetirá a renovação. Resultados serão `authenticated`, `refreshed` ou `anonymous`.

- [ ] **Passo 4: validar unidade e regressão**

Executar `npm test`, `npx tsc --noEmit` e `npm run lint`. Esperado: todos passam.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add lib/auth/session.ts lib/auth/session.test.ts
git commit -m "feat: implementa sessao rotativa"
```

## Tarefa 5: Endpoints BFF de autenticação local

**Arquivos:**
- Criar: `lib/auth/handlers.ts`
- Criar: `lib/auth/handlers.test.ts`
- Criar: `app/api/auth/login/route.ts`
- Criar: `app/api/auth/register/route.ts`
- Criar: `app/api/auth/session/route.ts`
- Criar: `app/api/auth/logout/route.ts`
- Criar: `app/api/auth/forgot-password/route.ts`
- Criar: `app/api/auth/reset-password/route.ts`
- Criar: `app/api/auth/resend-confirmation/route.ts`
- Criar: `app/api/auth/change-password/route.ts`

- [ ] **Passo 1: testar os handlers sem acoplar a lógica ao Next.js**

Escrever testes de comportamento para validação, origem, cookies e status HTTP. O caso de recuperação deve provar a resposta neutra:

```ts
expect(await handleForgotPassword(validRequest, failingClient)).toEqual({
  status: 200,
  body: { ok: true },
});
```

O login bem-sucedido deve retornar usuário público e duas instruções de cookie. Credenciais inválidas devem retornar `401` e `INVALID_CREDENTIALS`. Conta não confirmada deve retornar `403` e `EMAIL_NOT_CONFIRMED`.

- [ ] **Passo 2: executar e confirmar as falhas**

Executar `npm test -- lib/auth/handlers.test.ts`. Esperado: handlers ausentes.

- [ ] **Passo 3: implementar handlers e adaptadores Next.js**

`handlers.ts` receberá dependências injetadas. Cada `route.ts` apenas lerá a requisição, chamará o handler, criará `NextResponse.json` e aplicará cookies. `session/route.ts` aplicará tokens rotacionados ou apagará cookies conforme `resolveSession`. `logout/route.ts` tentará a revogação antes de limpar os cookies mesmo quando o Strapi estiver indisponível.

- [ ] **Passo 4: validar endpoints**

Executar `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build`. Esperado: todos passam.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add app/api/auth lib/auth
git commit -m "feat: adiciona bff de autenticacao local"
```

## Tarefa 6: Configuração reproduzível do Strapi

**Arquivos:**
- Modificar: `package.json`
- Modificar: `package-lock.json`
- Criar: `src/auth/config.ts`
- Criar: `src/auth/config.test.ts`
- Modificar: `src/index.ts`
- Modificar: `config/plugins.ts`
- Modificar: `config/server.ts`
- Modificar: `config/middlewares.ts`
- Modificar: `.env.example`

- [ ] **Passo 1: instalar dependências de e-mail e teste**

Executar no backend:

```powershell
npm install @strapi/provider-email-nodemailer@5.52.0
npm install --save-dev vitest
```

Adicionar `"test": "vitest run"` aos scripts.

- [ ] **Passo 2: escrever testes de configuração que falham**

`src/auth/config.test.ts` deve afirmar que `buildAdvancedSettings` preserva campos existentes e força cadastro, e-mail único, confirmação e URLs; que `buildGoogleProvider` desabilita o Google sem as duas credenciais; e que `buildEmailTemplates` usa remetente e URLs fornecidos sem inserir segredos.

Executar `npm test`. Esperado: falha porque `src/auth/config.ts` ainda não existe.

- [ ] **Passo 3: implementar funções puras e bootstrap idempotente**

`src/auth/config.ts` exportará:

```ts
export function buildAdvancedSettings(current: Record<string, unknown>, frontendUrl: string) {
  return {
    ...current,
    unique_email: true,
    allow_register: true,
    email_confirmation: true,
    email_reset_password: `${frontendUrl}/auth/reset-password`,
    email_confirmation_redirection: `${frontendUrl}/auth/email-confirmed`,
    default_role: "authenticated",
  };
}
```

Também exportará `buildGoogleProvider` e `buildEmailTemplates`. O bootstrap em `src/index.ts` obterá as chaves `advanced`, `grant` e `email`, mesclará somente os campos administrados pela aplicação e gravará apenas quando o valor for diferente.

- [ ] **Passo 4: configurar runtime do Strapi**

Em `plugins.ts`, manter uploads e adicionar JWT secret, `accessTokenLifespan: 600`, `maxRefreshTokenLifespan: 2592000`, `idleRefreshTokenLifespan: 1209600`, `maxSessionLifespan: 2592000`, `idleSessionLifespan: 1209600`, `httpOnly: false` e provider de e-mail Nodemailer. Em `server.ts`, adicionar `url: env("STRAPI_PUBLIC_URL")` e `proxy: true`. Em `middlewares.ts`, substituir `strapi::cors` por configuração que lê `CORS_ORIGINS` como lista, permite `GET`, `POST` e `OPTIONS`, aceita `Content-Type`, `Authorization` e `Origin` e habilita credenciais.

Completar `.env.example` com PostgreSQL, `FRONTEND_PUBLIC_URL`, `STRAPI_PUBLIC_URL`, `CORS_ORIGINS`, `SMTP_*`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

- [ ] **Passo 5: validar backend**

Executar:

```powershell
npm test
npm run build
```

Esperado: testes verdes e build do painel concluído. O diretório `fluent-too-api` não possui `.git`; registrar os arquivos alterados no resumo, sem inicializar repositório ou criar commit implicitamente.

## Tarefa 7: Google OAuth pelo BFF

**Arquivos:**
- Criar: `lib/auth/oauth.ts`
- Criar: `lib/auth/oauth.test.ts`
- Criar: `app/api/auth/google/route.ts`
- Criar: `app/api/auth/google/callback/route.ts`

- [ ] **Passo 1: testar destinos e callback antes da implementação**

Cobrir:

```ts
expect(buildGoogleStartUrl("https://api.example.com", "https://app.example.com/api/auth/google/callback", "/pt-br/dashboard")).toContain("/api/connect/google");
expect(parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?error=access_denied"))).toEqual({ ok: false, code: "GOOGLE_AUTH_FAILED" });
```

O teste de sucesso deve provar que o access token do Google é enviado somente ao Strapi, que os tokens do Strapi viram cookies e que a resposta final é um redirect sem parâmetros sensíveis.

- [ ] **Passo 2: observar as falhas**

Executar `npm test -- lib/auth/oauth.test.ts`. Esperado: módulo ausente.

- [ ] **Passo 3: implementar início e callback**

O início chamará `${STRAPI_PUBLIC_URL}/api/connect/google` com callback exato do frontend e destino interno codificado. O callback rejeitará erros, trocará `access_token` em `${STRAPI_INTERNAL_URL}/api/auth/google/callback`, gravará cookies e redirecionará ao destino seguro. O handler nunca renderizará uma página contendo o token do provedor.

- [ ] **Passo 4: validar testes e build**

Executar `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build`. Esperado: todos passam.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add lib/auth/oauth.ts lib/auth/oauth.test.ts app/api/auth/google
git commit -m "feat: adiciona login com Google"
```

## Tarefa 8: Interface localizada dos fluxos

**Arquivos:**
- Criar: `components/auth/AuthForm.tsx`
- Criar: `components/auth/AuthForm.test.tsx`
- Modificar: `app/[locale]/login/LoginForm.tsx`
- Criar: `app/[locale]/register/page.tsx`
- Criar: `app/[locale]/register/RegisterForm.tsx`
- Criar: `app/[locale]/forgot-password/page.tsx`
- Criar: `app/[locale]/forgot-password/ForgotPasswordForm.tsx`
- Criar: `app/[locale]/auth/reset-password/page.tsx`
- Criar: `app/[locale]/auth/reset-password/ResetPasswordForm.tsx`
- Criar: `app/[locale]/email-confirmation/page.tsx`
- Criar: `app/[locale]/auth/email-confirmed/page.tsx`
- Criar: `app/[locale]/dashboard/security/page.tsx`
- Criar: `app/[locale]/dashboard/security/ChangePasswordForm.tsx`
- Modificar: `lib/getDictionary.ts`
- Modificar: `messages/pt-br.json`
- Modificar: `messages/en-us.json`
- Modificar: `messages/fr-fr.json`

- [ ] **Passo 1: escrever testes de interação**

Usar Testing Library e `userEvent` para provar envio desabilitado durante request, erros por campo, mensagem de conta não confirmada, link de reenvio, preservação de `returnTo`, botão Google e anúncio acessível de erro com `role="alert"`.

- [ ] **Passo 2: confirmar as falhas por UI ainda estática**

Executar `npm test -- components/auth/AuthForm.test.tsx`. Esperado: componente ausente ou ausência dos comportamentos.

- [ ] **Passo 3: implementar os formulários e páginas**

Manter a composição visual existente do login. Substituir o skeleton social por botão Google com ícone acessível. Usar labels associados por `htmlFor`, `autocomplete="email"` para e-mail, `autocomplete="current-password"` para a senha atual, `autocomplete="new-password"` para novas senhas e estados de loading com dimensão estável. Os formulários chamarão exclusivamente `/api/auth/*`.

O reset exigirá `code` na query. A confirmação pendente permitirá reenvio. A página de confirmação concluída oferecerá login. A página de segurança exigirá sessão e senha atual.

- [ ] **Passo 4: completar as traduções tipadas**

Adicionar a mesma estrutura `auth` aos três JSONs, incluindo ações, validações, mensagens neutras, estados do Google e falhas normalizadas. Atualizar `Dictionary` sem tipos opcionais. Executar `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build`.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add components/auth app/[locale] lib/getDictionary.ts messages
git commit -m "feat: implementa interfaces de autenticacao"
```

## Tarefa 9: Proteção de rotas e estado no cabeçalho

**Arquivos:**
- Criar: `components/auth/AuthStatus.tsx`
- Criar: `components/auth/AuthStatus.test.tsx`
- Modificar: `components/home/Header.tsx`
- Modificar: `components/home/MobileMenu.tsx`
- Modificar: `app/[locale]/dashboard/page.tsx`
- Modificar: `app/[locale]/admin/page.tsx`
- Modificar: `proxy.ts`
- Criar: `lib/auth/proxy.ts`
- Criar: `lib/auth/proxy.test.ts`

- [ ] **Passo 1: escrever testes da política de acesso**

Cobrir paths localizados, ausência de cookie, sessão válida, rotação, sessão inválida e `returnTo`. A rota `/pt-br/dashboard/security` deve ser privada e `/pt-br/login` deve redirecionar usuário autenticado ao dashboard. `/pt-br/admin` deve redirecionar para `${STRAPI_PUBLIC_URL}/admin`.

- [ ] **Passo 2: confirmar falhas no proxy atual**

Executar `npm test -- lib/auth/proxy.test.ts components/auth/AuthStatus.test.tsx`. Esperado: módulos ausentes e dashboard público.

- [ ] **Passo 3: implementar política e interface de sessão**

Extrair a política para `lib/auth/proxy.ts` e manter `proxy.ts` como integração com `NextRequest` e `NextResponse`. Reutilizar `resolveSession`, aplicar cookies rotacionados na resposta e preservar o comportamento de locale existente. `AuthStatus` consultará `/api/auth/session`, exibirá entrada quando anônimo e dashboard/logout quando autenticado.

- [ ] **Passo 4: conectar dashboard e remover o falso admin**

O dashboard receberá dados do usuário validado e exibirá e-mail e acesso à segurança. A rota `/admin` não exibirá mais skeleton de gestão; ela redirecionará para `STRAPI_PUBLIC_URL/admin` somente quando a decisão puder ser feita no servidor e nunca receberá tokens de usuário do frontend.

Executar toda a suíte, TypeScript, lint e build.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add proxy.ts lib/auth components/auth components/home app/[locale]/dashboard app/[locale]/admin
git commit -m "feat: protege area autenticada"
```

## Tarefa 10: Docker do frontend

**Arquivos:**
- Modificar: `next.config.ts`
- Criar: `Dockerfile`
- Criar: `.dockerignore`
- Criar: `.env.example`

- [ ] **Passo 1: registrar a falha antes dos arquivos**

Executar `docker build -t fluent-too:test .`. Esperado: falha porque não existe `Dockerfile`.

- [ ] **Passo 2: habilitar standalone e criar imagem multi-stage**

Adicionar `output: "standalone"` ao `next.config.ts`. O Dockerfile terá estágios `deps`, `builder` e `runner`, instalará com `npm ci`, executará `npm run build`, copiará `.next/standalone`, `.next/static` e `public`, usará usuário não privilegiado, exporá `3000` e iniciará `server.js`.

- [ ] **Passo 3: restringir contexto e documentar runtime**

`.dockerignore` excluirá `.git`, `.next`, `node_modules`, arquivos de ambiente e cobertura. `.env.example` conterá somente chaves sem segredos: `NEXT_PUBLIC_SITE_URL`, `STRAPI_INTERNAL_URL`, `STRAPI_PUBLIC_URL`, `AUTH_COOKIE_SECURE` e timeouts.

- [ ] **Passo 4: construir e testar health endpoint**

Criar `app/api/health/route.ts` retornando `{ "status": "ok" }`. Escrever primeiro um teste do handler, observar falha, implementar e então executar:

```powershell
npm test
npm run build
docker build -t fluent-too:test .
```

Esperado: tudo verde e imagem criada.

- [ ] **Passo 5: versionar o checkpoint**

```powershell
git add next.config.ts Dockerfile .dockerignore .env.example app/api/health
git commit -m "build: adiciona imagem Docker do frontend"
```

## Tarefa 11: Docker do Strapi e PostgreSQL local

**Arquivos:**
- Criar no backend: `Dockerfile`
- Criar no backend: `.dockerignore`
- Criar no backend: `public/uploads/.gitkeep`
- Criar na raiz comum: `compose.yaml`
- Criar na raiz comum: `.env.example`

- [ ] **Passo 1: provar que as imagens ainda não podem ser construídas**

Executar `docker build -t fluent-too-api:test .` no backend. Esperado: falha por ausência de Dockerfile.

- [ ] **Passo 2: criar imagem multi-stage do Strapi**

Usar Node 22 slim nos estágios de dependências, build e runtime. Instalar dependências com `npm ci`, executar `npm run build`, copiar `dist`, `config`, `database`, `public`, `src`, `package*.json` e módulos de produção, usar usuário não privilegiado, expor `1337`, adicionar health check com `node -e "fetch('http://127.0.0.1:1337/_health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"` e iniciar `npm run start`.

- [ ] **Passo 3: criar Compose local**

O `compose.yaml` definirá `postgres:16-alpine` com health check `pg_isready`, volume nomeado, `axllent/mailpit` com SMTP em `1025` e interface/API em `8025`, backend dependente de banco saudável e frontend dependente do backend saudável. As URLs internas usarão os nomes `postgres`, `mailpit` e `api`; as portas públicas padrão serão `3000`, `1337`, `5432` e `8025`.

- [ ] **Passo 4: validar configuração e builds**

Executar:

```powershell
docker compose config
docker build -t fluent-too-api:test .
```

Esperado: configuração válida e imagem criada. Não inicializar Git no backend ou na raiz comum.

- [ ] **Passo 5: registrar os artefatos no resumo de execução**

Listar hashes das imagens, tamanhos e arquivos criados. O commit do frontend não deve incluir arquivos irmãos por estarem fora do repositório.

## Tarefa 12: Documentação operacional e validação integrada

**Arquivos:**
- Criar na raiz comum: `README.md`
- Modificar: `fluent-too/README.md`
- Modificar: `fluent-too-api/README.md`
- Criar: `fluent-too/scripts/auth-smoke.mjs`

- [ ] **Passo 1: escrever o smoke test antes de subir o conjunto**

O script aceitará `FRONTEND_URL` e `MAILPIT_URL`, criará um e-mail único, fará cadastro, confirmará que o login falha antes da confirmação, lerá a mensagem pela API HTTP do Mailpit, seguirá o link de confirmação, fará login, solicitará recuperação, lerá o novo e-mail no Mailpit, redefinirá a senha, renovará a sessão e fará logout. Também verificará que o dashboard redireciona sem sessão. Nenhum endpoint exclusivo de teste será adicionado ao frontend ou ao Strapi.

- [ ] **Passo 2: subir PostgreSQL, Strapi e Next.js**

Executar `docker compose up --build -d` e aguardar ambos os health checks. Se uma sessão de build continuar ativa, aguardar sua conclusão antes de seguir.

- [ ] **Passo 3: executar toda a matriz de validação**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
node scripts/auth-smoke.mjs
```

Executar no backend:

```powershell
npm test
npm run build
```

Executar na raiz:

```powershell
docker compose ps
docker compose logs --no-color --tail 100 api frontend postgres mailpit
```

Esperado: testes e builds com código zero, serviços saudáveis, nenhuma senha ou token nos logs e smoke test concluído.

- [ ] **Passo 4: documentar configuração externa**

O README raiz terá comandos locais, variáveis, criação do cliente OAuth no Google, callback `${STRAPI_PUBLIC_URL}/api/connect/google/callback`, configuração SMTP, volumes, health checks e mapeamento dos serviços no Dokploy. Os READMEs de cada projeto apontarão para as variáveis e o Dockerfile correspondentes.

- [ ] **Passo 5: verificação final e commit do frontend**

Executar `git diff --check`, `git status --short` e revisar que nenhum segredo ou comentário novo foi adicionado ao código. Versionar somente arquivos pertencentes ao frontend:

```powershell
git add README.md scripts/auth-smoke.mjs
git commit -m "docs: documenta autenticacao e deploy"
```

Parar o Compose somente depois de registrar os resultados e confirmar que o usuário não precisa do ambiente ativo.

## Ordem de execução no Dokploy

1. Criar PostgreSQL e volume persistente.
2. Publicar o Strapi com URL pública HTTPS, banco, SMTP e segredos.
3. Publicar o Next.js com URL interna do Strapi e URL pública dos dois serviços.
4. Configurar no Google o callback público exato do Strapi.
5. Reiniciar o Strapi para aplicar o provider Google no bootstrap.
6. Executar health checks e smoke test sem credenciais nos logs.
7. Testar manualmente confirmação e recuperação por e-mail real.
8. Testar manualmente login Google em janela anônima.
