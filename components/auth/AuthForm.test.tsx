import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm";

describe("AuthForm", () => {
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
});
