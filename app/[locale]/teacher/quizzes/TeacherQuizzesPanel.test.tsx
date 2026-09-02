import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ptBr from "@/messages/pt-br.json";
import type { Dictionary } from "@/lib/getDictionary";
import type { ManagedQuiz } from "@/lib/quizzes/manage-client";
import TeacherQuizzesPanel from "./TeacherQuizzesPanel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const dict = ptBr as unknown as Dictionary;

const quiz: ManagedQuiz = {
  documentId: "doc-1",
  title: "Saudações básicas",
  slug: "saudacoes-basicas",
  targetLanguage: "en",
  level: "A1",
  type: "multiple-choice",
  isPublic: true,
  publishedAt: "2026-08-30T12:00:00.000Z",
  questions: [{ id: "q1", question: "Bom dia?", options: ["Good morning", "Good night"], correctAnswer: "Good morning" }],
};

function renderPanel(overrides: Partial<Parameters<typeof TeacherQuizzesPanel>[0]> = {}) {
  return render(
    <TeacherQuizzesPanel
      dict={dict}
      locale="pt-br"
      languages={["en"]}
      initialQuizzes={[quiz]}
      initialFailed={false}
      dashboardHref="/pt-br/dashboard"
      {...overrides}
    />
  );
}

describe("TeacherQuizzesPanel", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lista os quizzes do professor com idioma, nível e situação", () => {
    renderPanel();

    expect(screen.getByRole("cell", { name: /Saudações básicas/ })).toBeInTheDocument();
    expect(screen.getByText(/English · A1 · Múltipla escolha/)).toBeInTheDocument();
    expect(screen.getByText("Publicado")).toBeInTheDocument();
  });

  it("pagina a lista e mostra o intervalo visível", async () => {
    const user = userEvent.setup();
    const muitos = Array.from({ length: 12 }, (_, index) => ({
      ...quiz,
      documentId: "doc-" + index,
      title: "Aula " + String(index + 1).padStart(2, "0"),
    }));

    renderPanel({ initialQuizzes: muitos });

    expect(screen.getByText("1–10 de 12")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Aula 01/ })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: /Aula 11/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));

    expect(screen.getByText("11–12 de 12")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Aula 11/ })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: /Aula 01/ })).not.toBeInTheDocument();
  });

  it("oferece apenas os idiomas aprovados no formulário", async () => {
    const user = userEvent.setup();
    renderPanel({ languages: ["en", "fr"] });

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));

    const select = screen.getByLabelText(/Idioma/);
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual(["English", "Français"]);
  });

  it("bloqueia a criação e avisa quando nenhum idioma foi aprovado", () => {
    renderPanel({ languages: [] });

    expect(screen.queryByRole("button", { name: "Novo quiz" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Sua conta ainda não tem idiomas aprovados");
  });

  it("troca os campos do editor conforme o tipo escolhido", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));
    expect(screen.getByRole("group", { name: /Alternativas/ })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Tipo de quiz/), "flashcard");
    expect(screen.queryByRole("group", { name: /Alternativas/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Frente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Verso/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Tipo de quiz/), "fill-gap");
    expect(screen.getByLabelText(/Frase com lacunas/)).toBeInTheDocument();
  });

  it("cria um campo de resposta para cada lacuna digitada", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));
    await user.selectOptions(screen.getByLabelText(/Tipo de quiz/), "fill-gap");
    await user.type(screen.getByLabelText(/Frase com lacunas/), "It is ___ the ___.");

    const answers = screen.getByRole("group", { name: /Respostas das lacunas/ });
    expect(within(answers).getAllByRole("textbox")).toHaveLength(2);
  });

  it("recusa salvar questão incompleta sem chamar a API", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));
    await user.type(screen.getByLabelText(/Título/), "Quiz novo");
    await user.click(screen.getByRole("button", { name: "Salvar quiz" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Uma das questões está incompleta");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("mostra a mensagem do erro devolvido pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "SLUG_TAKEN" }), { status: 400 })
    );
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));
    await fillMultipleChoice(user);
    await user.click(screen.getByRole("button", { name: "Salvar quiz" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Já existe um quiz com esse título");
    });
  });

  it("envia a criação e recarrega a lista ao salvar", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: { documentId: "doc-2" } }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: [quiz] }), { status: 200 }));
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Novo quiz" }));
    await fillMultipleChoice(user);
    await user.click(screen.getByRole("button", { name: "Salvar quiz" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Quiz salvo e publicado.");
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/quizzes");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({
      title: "Quiz novo",
      targetLanguage: "en",
      type: "multiple-choice",
      questions: [{ question: "Bom dia?", options: ["Good morning", "Good night"], correctAnswer: "Good morning" }],
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("atualiza pelo documentId ao editar um quiz existente", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: quiz }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: [quiz] }), { status: 200 }));
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Salvar quiz" }));

    await waitFor(() => {
      expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/quizzes/doc-1");
    });
    expect((vi.mocked(fetch).mock.calls[0][1] as RequestInit).method).toBe("PUT");
  });

  it("pede confirmação antes de excluir", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: [] }), { status: 200 }));
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Excluir quiz");
    expect(fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Excluir definitivamente" }));

    await waitFor(() => {
      expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/quizzes/doc-1");
    });
    expect((vi.mocked(fetch).mock.calls[0][1] as RequestInit).method).toBe("DELETE");
  });
});

async function fillMultipleChoice(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Título/), "Quiz novo");
  await user.type(screen.getByLabelText(/Enunciado/), "Bom dia?");

  const options = within(screen.getByRole("group", { name: /Alternativas/ })).getAllByRole("textbox");
  await user.type(options[0]!, "Good morning");
  await user.type(options[1]!, "Good night");

  await user.selectOptions(screen.getByLabelText(/Alternativa correta/), "Good morning");
}
