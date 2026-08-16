import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm";

describe("AuthForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("desabilita envio durante request e exibe erro acessivel", async () => {
    const user = userEvent.setup();
    const submit = vi.fn(async () => ({ ok: false as const, error: "INVALID_CREDENTIALS" }));

    render(
      <AuthForm
        title="Entrar"
        subtitle="Acesse sua conta"
        submitLabel="Entrar"
        fields={[
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          { name: "password", label: "Senha", type: "password", autoComplete: "current-password" },
        ]}
        onSubmit={submit}
        messages={{ INVALID_CREDENTIALS: "Credenciais invalidas" }}
        visualTitle="Fluent Too"
        visualText="Aprenda idiomas com pratica guiada."
        googleHref="/api/auth/google?returnTo=%2Fpt-br%2Fdashboard"
        googleLabel="Continuar com Google"
      />
    );

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciais invalidas");
    expect(screen.getByRole("link", { name: "Continuar com Google" })).toHaveAttribute(
      "href",
      "/api/auth/google?returnTo=%2Fpt-br%2Fdashboard"
    );
  });

  it("renderiza campo escondido de username sem enviar para o submit", async () => {
    const user = userEvent.setup();
    const submit = vi.fn(async () => ({ ok: true as const }));

    const { container } = render(
      <AuthForm
        title="Seguranca"
        subtitle="Atualize sua senha"
        submitLabel="Salvar senha"
        fields={[
          {
            name: "username",
            label: "E-mail",
            type: "hidden",
            autoComplete: "username",
            value: "user@example.com",
            submit: false,
          },
          { name: "password", label: "Nova senha", type: "password", autoComplete: "new-password" },
        ]}
        onSubmit={submit}
        messages={{}}
        visualTitle="Fluent Too"
        visualText="Aprenda idiomas com pratica guiada."
      />
    );

    const username = container.querySelector<HTMLInputElement>('input[name="username"]');
    expect(username).toHaveAttribute("autocomplete", "username");
    expect(username).toHaveClass("sr-only");

    const password = screen.getByLabelText("Nova senha");
    await user.type(password, "Password@123");
    expect(password).toHaveValue("Password@123");
    await user.click(screen.getByRole("button", { name: "Salvar senha" }));

    expect(submit).toHaveBeenCalledWith({ password: "Password@123" });
  });
});
