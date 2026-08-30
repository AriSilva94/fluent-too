import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Breadcrumbs from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  afterEach(() => cleanup());

  it("renderiza links de volta e pagina atual", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Painel", href: "/pt-br/dashboard" },
          { label: "Candidaturas de professores" },
        ]}
      />
    );

    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("href", "/pt-br/dashboard");
    expect(screen.getByText("Candidaturas de professores")).toBeInTheDocument();
  });
});
