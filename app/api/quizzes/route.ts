import { NextResponse } from "next/server";
import { canReviewTeachers } from "@/lib/auth/roles";
import { isLanguageAllowed, validateQuizInput } from "@/lib/quizzes/manage";
import { createQuizManageClient } from "@/lib/quizzes/manage-client";
import { authorizeQuizRequest, withRefreshedCookies } from "./_shared";

export async function GET(request: Request) {
  const guard = await authorizeQuizRequest(request, { requireTrustedOrigin: false });
  if ("response" in guard) return guard.response;

  const result = await createQuizManageClient().listOwn(guard.accessToken);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error, data: [] }, { status: result.status });

  return withRefreshedCookies(request, guard, response);
}

export async function POST(request: Request) {
  const guard = await authorizeQuizRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

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

  const result = await createQuizManageClient().create(guard.accessToken, input.data);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data }, { status: 201 })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withRefreshedCookies(request, guard, response);
}
