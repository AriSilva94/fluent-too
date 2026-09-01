import { APP_ROLES, type AppRole } from "./contracts";

const ADMIN_ROLES: AppRole[] = [APP_ROLES.appAdmin, APP_ROLES.superAdmin];

export function isAdmin(role?: AppRole) {
  return Boolean(role) && ADMIN_ROLES.includes(role!);
}

export function isSuperAdmin(role?: AppRole) {
  return role === APP_ROLES.superAdmin;
}

export function canCreateContent(role?: AppRole) {
  return role === APP_ROLES.teacher || isAdmin(role);
}

export function canManageContent(role?: AppRole) {
  return isAdmin(role);
}

export function canReviewTeachers(role?: AppRole) {
  return isAdmin(role);
}

export function isPendingTeacher(role?: AppRole) {
  return role === APP_ROLES.teacherPending;
}

export function isUnassigned(role?: AppRole) {
  return role === APP_ROLES.unassigned;
}

export function hasProfile(role?: AppRole) {
  return Boolean(role) && !isUnassigned(role);
}
