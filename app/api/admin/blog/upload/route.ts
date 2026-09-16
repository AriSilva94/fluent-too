import { NextResponse } from "next/server";
import { createBlogManageClient } from "@/lib/blog/manage-client";
import { authorizeAdminRequest, withAdminCookies } from "../../_shared";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  const guard = await authorizeAdminRequest(request, { requireTrustedOrigin: true });
  if ("response" in guard) return guard.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 }));
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "INVALID_FILE_TYPE" }, { status: 400 }));
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return withAdminCookies(request, guard, NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 400 }));
  }

  const result = await createBlogManageClient().uploadCoverImage(guard.accessToken, file);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data }, { status: 201 })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  return withAdminCookies(request, guard, response);
}
