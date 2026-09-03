import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthStatus from "./AuthStatus";
import { resetFeed } from "@/lib/notifications/store";
import { resetSession } from "@/lib/auth/session-store";
import ptBr from "@/messages/pt-br.json";
import type { Dictionary } from "@/lib/getDictionary";

const dict = ptBr as unknown as Dictionary;

type SessionBody = { ok: boolean; user?: unknown };

function stubFetch(session: SessionBody, feed: unknown = { items: [], unreadCount: 0, seenAt: null }) {
  const fetcher = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/auth/session")) return new Response(JSON.stringify(session));
    if (url.includes("/api/notifications")) return new Response(JSON.stringify({ ok: true, data: feed }));
    return new Response(JSON.stringify({ ok: true }));
  });
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

describe("AuthStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetFeed();
    resetSession();
  });

  it("exibe entrada quando anonimo", async () => {
    stubFetch({ ok: false, user: null });
    render(<AuthStatus locale="pt-br" dict={dict} />);

    expect(await screen.findByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/pt-br/login");
    expect(screen.queryByRole("button", { name: /notifica/i })).not.toBeInTheDocument();
  });

  it("mostra painel e segurança para aluno, sem áreas restritas", async () => {
    stubFetch({ ok: true, user: { email: "aluno@example.com", role: { type: "student" } } });
    const user = userEvent.setup();
    render(<AuthStatus locale="pt-br" dict={dict} />);

    await user.click(await screen.findByRole("button", { name: "aluno@example.com" }));

    expect(await screen.findByRole("link", { name: dict.dashboard.title })).toHaveAttribute("href", "/pt-br/dashboard");
    expect(screen.getByRole("link", { name: dict.account.security })).toHaveAttribute("href", "/pt-br/dashboard/security");
    expect(screen.getByText(dict.account.roleStudent)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: dict.admin.title })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: dict.teacher.title })).not.toBeInTheDocument();
  });

  it("abre a área de quizzes para professor", async () => {
    stubFetch({ ok: true, user: { email: "prof@example.com", role: { type: "teacher" } } });
    const user = userEvent.setup();
    render(<AuthStatus locale="pt-br" dict={dict} />);

    await user.click(await screen.findByRole("button", { name: "prof@example.com" }));

    expect(await screen.findByRole("link", { name: dict.teacher.title })).toHaveAttribute("href", "/pt-br/teacher/quizzes");
    expect(screen.queryByRole("link", { name: dict.admin.title })).not.toBeInTheDocument();
  });

  it("abre o painel administrativo para admin e desloga", async () => {
    const fetcher = stubFetch({ ok: true, user: { email: "admin@example.com", role: { type: "app_admin" } } });
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(<AuthStatus locale="pt-br" dict={dict} navigate={navigate} />);

    await user.click(await screen.findByRole("button", { name: "admin@example.com" }));
    expect(await screen.findByRole("link", { name: dict.admin.title })).toHaveAttribute("href", "/pt-br/admin");

    await user.click(screen.getByRole("button", { name: dict.auth.logout }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }));
    expect(navigate).toHaveBeenCalledWith("/pt-br/login");
  });
});
