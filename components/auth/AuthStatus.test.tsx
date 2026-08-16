import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthStatus from "./AuthStatus";

describe("AuthStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe entrada quando anonimo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: false, user: null }))));
    render(<AuthStatus locale="pt-br" labels={{ login: "Entrar", dashboard: "Painel", logout: "Sair" }} />);

    expect(await screen.findByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/pt-br/login");
  });

  it("exibe dashboard e logout quando autenticado", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, user: { email: "user@example.com" } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(<AuthStatus locale="pt-br" labels={{ login: "Entrar", dashboard: "Painel", logout: "Sair" }} navigate={navigate} />);

    expect(await screen.findByRole("link", { name: "Painel" })).toHaveAttribute("href", "/pt-br/dashboard");
    await user.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }));
    expect(navigate).toHaveBeenCalledWith("/pt-br/login");
  });
});
