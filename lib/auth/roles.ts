import type { AppRole } from "./contracts";

export function canCreateContent(role?: AppRole) {
  return role === "teacher" || canReviewTeachers(role);
}

export function canReviewTeachers(role?: AppRole) {
  return role === "app_admin" || role === "super_admin";
}

export function isPendingTeacher(role?: AppRole) {
  return role === "teacher_pending";
}
