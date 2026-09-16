import type { ApplicationResult } from "@/lib/profile/client";
import { APPLICATION_STATUS } from "@/lib/teacher-applications/client";

export type TeacherApplicationView = typeof APPLICATION_STATUS.pending | typeof APPLICATION_STATUS.rejected;

export function resolveTeacherApplicationView(result: ApplicationResult): {
  view: TeacherApplicationView;
  reviewNote: string | null;
} {
  if (!result.ok || !result.data || result.data.status !== APPLICATION_STATUS.rejected) {
    return { view: APPLICATION_STATUS.pending, reviewNote: null };
  }
  return { view: APPLICATION_STATUS.rejected, reviewNote: result.data.reviewNote };
}
