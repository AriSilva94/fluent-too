import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationBell from "./NotificationBell";
import { resetFeed } from "@/lib/notifications/store";
import ptBr from "@/messages/pt-br.json";
import type { Dictionary } from "@/lib/getDictionary";

const labels = (ptBr as unknown as Dictionary).notifications;

const feed = {
  items: [
    {
      id: "teacher_application:7",
      kind: "teacher_application",
      createdAt: new Date().toISOString(),
      read: false,
      href: "/admin/teachers",
      data: { name: "Ana", email: "ana@x.com" },
    },
    {
      id: "new_student:3",
      kind: "new_student",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      href: null,
      data: { name: "Bruno", email: "bruno@x.com" },
    },
  ],
  unreadCount: 1,
  seenAt: null,
};

function stubFetch(body: unknown, ok = true) {
  const fetcher = vi.fn(async () => new Response(JSON.stringify(body), { status: ok ? 200 : 502 }));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetFeed();
  });

  it("sinaliza a quantidade não lida no rótulo do botão", async () => {
    stubFetch({ ok: true, data: feed });
    render(<NotificationBell locale="pt-br" labels={labels} />);

    expect(await screen.findByRole("button", { name: `${labels.label} (1)` })).toBeInTheDocument();
  });

  it("lista as notificações com link e texto interpolado", async () => {
    stubFetch({ ok: true, data: feed });
    const user = userEvent.setup();
    render(<NotificationBell locale="pt-br" labels={labels} />);

    await user.click(await screen.findByRole("button", { name: `${labels.label} (1)` }));

    expect(await screen.findByRole("link", { name: /Ana quer ensinar na plataforma/ })).toHaveAttribute(
      "href",
      "/pt-br/admin/teachers"
    );
    expect(screen.getByText("Bruno entrou como aluno")).toBeInTheDocument();
  });

  it("marca tudo como lido e some com o aviso", async () => {
    const fetcher = stubFetch({ ok: true, data: feed });
    const user = userEvent.setup();
    render(<NotificationBell locale="pt-br" labels={labels} />);

    await user.click(await screen.findByRole("button", { name: `${labels.label} (1)` }));
    await user.click(await screen.findByRole("button", { name: labels.markAll }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/notifications/seen", { method: "POST" }));
    expect(await screen.findByRole("button", { name: labels.label })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.markAll })).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando não há nada", async () => {
    stubFetch({ ok: true, data: { items: [], unreadCount: 0, seenAt: null } });
    const user = userEvent.setup();
    render(<NotificationBell locale="pt-br" labels={labels} />);

    await user.click(await screen.findByRole("button", { name: labels.label }));
    expect(await screen.findByText(labels.empty)).toBeInTheDocument();
  });

  it("oferece nova tentativa quando a busca falha", async () => {
    stubFetch({ ok: false }, false);
    const user = userEvent.setup();
    render(<NotificationBell locale="pt-br" labels={labels} />);

    await user.click(await screen.findByRole("button", { name: labels.label }));
    expect(await screen.findByText(labels.loadError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: labels.retry })).toBeInTheDocument();
  });
});
