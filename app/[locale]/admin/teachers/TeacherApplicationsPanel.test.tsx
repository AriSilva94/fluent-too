import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ptBr from "@/messages/pt-br.json";
import type { Dictionary } from "@/lib/getDictionary";
import TeacherApplicationsPanel from "./TeacherApplicationsPanel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const dict = ptBr as unknown as Dictionary;

const application = {
  id: 12,
  status: "pending",
  user: { id: 3, email: "professor@example.com" },
  languages: ["en"],
  bio: "Professor com experiencia.",
  experience: "Cinco anos de aulas.",
};

function renderPanel() {
  return render(
    <TeacherApplicationsPanel
      dict={dict}
      locale="pt-br"
      initialApplications={[application]}
      initialStatus="pending"
      dashboardHref="/pt-br/dashboard"
    />
  );
}

describe("TeacherApplicationsPanel", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ok: true, data: [] }),
      }))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("abre confirmacao antes de aprovar e so chama a API ao confirmar", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Aprovar" }));

    expect(screen.getByRole("dialog", { name: "Aprovar candidatura?" })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith("/api/teacher-applications/12/approve", expect.anything());

    await user.click(screen.getByRole("button", { name: "Aprovar professor" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/teacher-applications/12/approve",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("exige justificativa no modal antes de rejeitar", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Rejeitar" }));
    expect(screen.getByRole("dialog", { name: "Rejeitar candidatura?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rejeitar candidatura" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Informe um motivo antes de rejeitar.");
    expect(fetch).not.toHaveBeenCalledWith("/api/teacher-applications/12/reject", expect.anything());

    await user.type(screen.getByLabelText("Motivo da rejeição"), "Faltou comprovante.");
    await user.click(screen.getByRole("button", { name: "Rejeitar candidatura" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/teacher-applications/12/reject",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reviewNote: "Faltou comprovante." }),
        })
      );
    });
  });

  it("mostra breadcrumb de volta para o dashboard", () => {
    renderPanel();

    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("href", "/pt-br/dashboard");
    expect(screen.getByText("Candidaturas de professores", { selector: "[aria-current='page']" })).toBeInTheDocument();
  });
});
