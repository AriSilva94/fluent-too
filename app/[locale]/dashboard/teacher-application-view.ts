import type { ApplicationResult } from "@/lib/profile/client";

export type TeacherApplicationView = "pending" | "rejected";

export function resolveTeacherApplicationView(result: ApplicationResult): {
  view: TeacherApplicationView;
  reviewNote: string | null;
} {
  if (!result.ok || !result.data || result.data.status !== "rejected") {
    return { view: "pending", reviewNote: null };
  }
  return { view: "rejected", reviewNote: result.data.reviewNote };
}
