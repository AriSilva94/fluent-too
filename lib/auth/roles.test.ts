import { describe, expect, it } from "vitest";
import { canCreateContent, canReviewTeachers, isPendingTeacher } from "./roles";

describe("capacidades por role", () => {
  it("define quem cria conteúdo", () => {
    expect(canCreateContent("teacher")).toBe(true);
    expect(canCreateContent("app_admin")).toBe(true);
    expect(canCreateContent("super_admin")).toBe(true);
    expect(canCreateContent("teacher_pending")).toBe(false);
    expect(canCreateContent("student")).toBe(false);
    expect(canCreateContent(undefined)).toBe(false);
  });

  it("define quem revisa candidaturas", () => {
    expect(canReviewTeachers("app_admin")).toBe(true);
    expect(canReviewTeachers("super_admin")).toBe(true);
    expect(canReviewTeachers("teacher")).toBe(false);
    expect(canReviewTeachers("student")).toBe(false);
    expect(canReviewTeachers(undefined)).toBe(false);
  });

  it("identifica professor pendente", () => {
    expect(isPendingTeacher("teacher_pending")).toBe(true);
    expect(isPendingTeacher("teacher")).toBe(false);
    expect(isPendingTeacher(undefined)).toBe(false);
  });
});
