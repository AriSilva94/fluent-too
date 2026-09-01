import { NextResponse } from "next/server";
import { createQuizManageClient } from "@/lib/quizzes/manage-client";
import { TARGET_LANGUAGES } from "@/lib/quizzes/manage";
import { authorizeAdminRequest, withAdminCookies } from "../_shared";

export async function GET(request: Request) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: false });
  if ("response" in guard) return guard.response;

  const requested = new URL(request.url).searchParams.get("targetLanguage");
  const targetLanguage = TARGET_LANGUAGES.includes(requested as never) ? requested! : undefined;

  const result = await createQuizManageClient().listAll(guard.accessToken, { targetLanguage });
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error, data: [] }, { status: result.status });

  return withAdminCookies(request, guard, response);
}
