import { NextResponse } from "next/server";
import { readTokenCookies } from "@/app/api/auth/_shared";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";

type ReviewAction = "approve" | "reject";

export function parseReviewAction(value: string): ReviewAction | null {
  return value === "approve" || value === "reject" ? value : null;
}

export function validateRejectNote(value: unknown): { ok: true; note: string } | { ok: false; error: "REVIEW_NOTE_REQUIRED" } {
  const note = typeof value === "string" ? value.trim() : "";
  if (!note) return { ok: false, error: "REVIEW_NOTE_REQUIRED" };
  return { ok: true, note };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action: rawAction } = await params;
  const action = parseReviewAction(rawAction);
  if (!action) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  if (!isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  const { accessToken } = readTokenCookies(request);
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { reviewNote?: unknown };
  const client = createTeacherApplicationsClient();

  const result =
    action === "approve"
      ? await client.approve(accessToken, Number(id))
      : await reject(client, accessToken, Number(id), body.reviewNote);

  if (!result.ok) {
    const status = result.error === "ALREADY_REVIEWED" ? 409 : result.error === "REVIEW_NOTE_REQUIRED" ? 400 : 502;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
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
