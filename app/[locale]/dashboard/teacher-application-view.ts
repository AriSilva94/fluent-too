import type { ApplicationResult } from "@/lib/profile/client";

export type TeacherApplicationView = "pending" | "rejected";

/**
 * Decide o que mostrar a um `teacher_pending` a partir do resultado da busca da
 * própria candidatura. Qualquer falha (rede, resposta não-ok, corpo vazio) ou um
 * status que não seja `rejected` cai em "pending" sem motivo: é o lado seguro de
 * errar — dizer "em análise" para quem já foi aprovado/rejeitado é inofensivo,
 * mas mostrar a tela de recusa por engano não é.
 *
 * Vive fora de `TeacherApplicationStatus.tsx` porque quem chama é a página, que é
 * um Server Component: uma função exportada de um módulo `"use client"` vira uma
 * referência de cliente e não pode ser invocada no servidor.
 */
export function resolveTeacherApplicationView(result: ApplicationResult): {
  view: TeacherApplicationView;
  reviewNote: string | null;
} {
  if (!result.ok || !result.data || result.data.status !== "rejected") {
    return { view: "pending", reviewNote: null };
  }
  return { view: "rejected", reviewNote: result.data.reviewNote };
}
