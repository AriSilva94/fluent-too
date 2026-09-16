import { NextResponse } from "next/server";
import { validateBlogPostInput } from "@/lib/blog/manage";
import { createBlogManageClient } from "@/lib/blog/manage-client";
import { authorizeAdminRequest, withAdminCookies } from "../_shared";

export async function GET(request: Request) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: false });
  if ("response" in guard) return guard.response;

  const result = await createBlogManageClient().list(guard.accessToken);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error, data: [] }, { status: result.status });

  return withAdminCookies(request, guard, response);
}

export async function POST(request: Request) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const body = await request.json().catch(() => null);
  const input = validateBlogPostInput(body);
  if (!input.ok) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: input.error }, { status: 400 }));
  }

  const result = await createBlogManageClient().create(guard.accessToken, input.data);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data }, { status: 201 })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withAdminCookies(request, guard, response);
}
