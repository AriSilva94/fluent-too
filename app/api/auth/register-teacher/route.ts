import { NextResponse } from "next/server";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { validateAttachment, validateTeacherRegister } from "@/lib/auth/teacher-registration";

const STRAPI_URL = process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  const form = await request.formData();
  const payload = validateTeacherRegister({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    passwordConfirmation: String(form.get("passwordConfirmation") ?? ""),
    bio: String(form.get("bio") ?? ""),
    experience: String(form.get("experience") ?? ""),
    languages: form.getAll("languages").map(String),
    credentialUrl: String(form.get("credentialUrl") ?? ""),
  });
  if (!payload.ok) return NextResponse.json({ ok: false, fieldErrors: payload.fieldErrors }, { status: 400 });

  const file = form.get("attachment");
  const attachment = file instanceof File && file.size > 0 ? file : null;
  const attachmentCheck = validateAttachment(attachment);
  if (!attachmentCheck.ok) return NextResponse.json({ ok: false, error: attachmentCheck.error }, { status: 400 });

  const response = attachment
    ? await forwardMultipart(payload.data, attachment)
    : await forwardJson(payload.data);

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    const error = body.error?.message ?? "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error }, { status: response.status });
  }

  return NextResponse.json({ ok: true });
}

function forwardJson(data: Record<string, unknown>) {
  return fetch(`${STRAPI_URL}/api/auth/local/register-teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

function forwardMultipart(data: Record<string, unknown>, attachment: File) {
  const body = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach((item) => body.append(key, String(item)));
    } else if (value !== undefined) {
      body.append(key, String(value));
    }
  }
  body.append("attachment", attachment);

  return fetch(`${STRAPI_URL}/api/auth/local/register-teacher`, {
    method: "POST",
    body,
  });
}
