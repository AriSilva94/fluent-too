import { NextResponse } from "next/server";
import { validateBlogPostInput } from "@/lib/blog/manage";
import { createBlogManageClient } from "@/lib/blog/manage-client";
import { authorizeAdminRequest, withAdminCookies } from "../../_shared";

export function parseDocumentId(value: string) {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const documentId = parseDocumentId((await params).id);
  if (!documentId) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 }));
  }

  const body = await request.json().catch(() => null);
  const input = validateBlogPostInput(body);
  if (!input.ok) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: input.error }, { status: 400 }));
  }

  const result = await createBlogManageClient().update(guard.accessToken, documentId, input.data);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withAdminCookies(request, guard, response);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const documentId = parseDocumentId((await params).id);
  if (!documentId) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 }));
  }

  const result = await createBlogManageClient().remove(guard.accessToken, documentId);
  const response = result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withAdminCookies(request, guard, response);
}
