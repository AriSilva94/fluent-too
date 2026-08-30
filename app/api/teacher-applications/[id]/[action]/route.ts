import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";

type ReviewAction = "approve" | "reject";

export function parseReviewAction(value: string): ReviewAction | null {
  return value === "approve" || value === "reject" ? value : null;
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
  if (session.status === "anonymous") return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const id = parseApplicationId(rawId);
  if (!id) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { reviewNote?: unknown };
  const client = createTeacherApplicationsClient();

  const result = action === "approve" ? await client.approve(accessToken, id) : await reject(client, accessToken, id, body.reviewNote);

  if (!result.ok) {
    const status = result.error === "ALREADY_REVIEWED" ? 409 : result.error === "REVIEW_NOTE_REQUIRED" ? 400 : 502;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  const response = NextResponse.json({ ok: true });
  if (session.status === "refreshed") {
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
