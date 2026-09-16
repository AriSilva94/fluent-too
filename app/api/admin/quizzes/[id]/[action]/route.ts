import { NextResponse } from "next/server";
import { isMemberOf } from "@/lib/enums";
import { createQuizManageClient, MODERATION_ACTION } from "@/lib/quizzes/manage-client";
import { authorizeAdminRequest, withAdminCookies } from "../../../_shared";

export function parseModerationAction(value: string) {
  return isMemberOf(MODERATION_ACTION, value) ? value : null;
}

export function parseDocumentId(value: string) {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id: rawId, action: rawAction } = await params;

  const action = parseModerationAction(rawAction);
  if (!action) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const documentId = parseDocumentId(rawId);
  if (!documentId) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 }));
  }

  const result = await createQuizManageClient().setPublished(guard.accessToken, documentId, action === MODERATION_ACTION.publish);
  const response = result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withAdminCookies(request, guard, response);
}
