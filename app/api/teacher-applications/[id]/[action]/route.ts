import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { createTeacherApplicationsClient, REVIEW_ACTION, REVIEW_ERROR, type ReviewAction } from "@/lib/teacher-applications/client";
import { isMemberOf } from "@/lib/enums";

export function parseReviewAction(value: string): ReviewAction | null {
  return isMemberOf(REVIEW_ACTION, value) ? value : null;
}

export function parseApplicationId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function validateRejectNote(value: unknown): { ok: true; note: string } | { ok: false; error: "REVIEW_NOTE_REQUIRED" } {
  const note = typeof value === "string" ? value.trim() : "";
  if (!note) return { ok: false, error: "REVIEW_NOTE_REQUIRED" };
  return { ok: true, note };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id: rawId, action: rawAction } = await params;
  const action = parseReviewAction(rawAction);
  if (!action) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  if (!isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const id = parseApplicationId(rawId);
  if (!id) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { reviewNote?: unknown };
  const client = createTeacherApplicationsClient();

  const result = action === REVIEW_ACTION.approve ? await client.approve(accessToken, id) : await reject(client, accessToken, id, body.reviewNote);

  if (!result.ok) {
    const status = result.error === REVIEW_ERROR.alreadyReviewed ? 409 : result.error === REVIEW_ERROR.reviewNoteRequired ? 400 : 502;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  const response = NextResponse.json({ ok: true });
  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}

async function reject(
  client: ReturnType<typeof createTeacherApplicationsClient>,
  accessToken: string,
  id: number,
  reviewNote: unknown
) {
  const note = validateRejectNote(reviewNote);
  if (!note.ok) return note;
  return client.reject(accessToken, id, note.note);
}
