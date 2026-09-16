import { NextResponse } from "next/server";
import { canReviewTeachers } from "@/lib/auth/roles";
import { isLanguageAllowed, validateQuizInput } from "@/lib/quizzes/manage";
import { createQuizManageClient } from "@/lib/quizzes/manage-client";
import { authorizeQuizRequest, withRefreshedCookies } from "../_shared";

export function parseDocumentId(value: string) {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authorizeQuizRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const documentId = parseDocumentId((await params).id);
  if (!documentId) {
    return withRefreshedCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 }));
  }

  const body = await request.json().catch(() => null);
  const input = validateQuizInput(body);
  if (!input.ok) {
    return withRefreshedCookies(request, guard, NextResponse.json({ ok: false, error: input.error }, { status: 400 }));
  }

  const isAdmin = canReviewTeachers(guard.user.role?.type);
  if (!isLanguageAllowed(guard.user.teachingLanguages, input.data.targetLanguage, isAdmin)) {
    return withRefreshedCookies(
      request,
      guard,
      NextResponse.json({ ok: false, error: "LANGUAGE_NOT_ALLOWED" }, { status: 403 })
    );
  }

  const result = await createQuizManageClient().update(guard.accessToken, documentId, input.data);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withRefreshedCookies(request, guard, response);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authorizeQuizRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const documentId = parseDocumentId((await params).id);
  if (!documentId) {
    return withRefreshedCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 }));
  }

  const result = await createQuizManageClient().remove(guard.accessToken, documentId);
  const response = result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withRefreshedCookies(request, guard, response);
}
