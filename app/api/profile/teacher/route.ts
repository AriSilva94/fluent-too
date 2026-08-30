import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { createProfileClient } from "@/lib/profile/client";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { validateAttachment, validateTeacherApplication } from "@/lib/auth/teacher-registration";

// 5 MB de anexo (o limite de `validateAttachment`) + folga para os demais campos de
// texto do multipart e para os cabeçalhos de cada parte.
export const MAX_TEACHER_APPLICATION_BODY_BYTES = 5 * 1024 * 1024 + 256 * 1024;

/**
 * `request.formData()` materializa o corpo inteiro em memória. Sem teto, alguns POSTs
 * concorrentes de centenas de MB derrubam o servidor Next — por isso a recusa acontece
 * pelo content-length, antes de ler o corpo.
 */
export function isBodyWithinLimit(contentLength: string | null, maxBytes = MAX_TEACHER_APPLICATION_BODY_BYTES) {
  if (contentLength === null) return false;
  const length = Number(contentLength);
  return Number.isFinite(length) && length >= 0 && length <= maxBytes;
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  if (!isBodyWithinLimit(request.headers.get("content-length"))) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (session.status === "anonymous") return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const form = await request.formData();
  const payload = validateTeacherApplication({
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

  const body = new FormData();
  body.append("bio", payload.data.bio);
  body.append("experience", payload.data.experience);
  payload.data.languages.forEach((language) => body.append("languages", language));
  if (payload.data.credentialUrl) body.append("credentialUrl", payload.data.credentialUrl);
  if (attachment) body.append("attachment", attachment);

  const result = await createProfileClient().becomeTeacher(accessToken, body);
  const response = result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status ?? 502 });

  if (session.status === "refreshed") {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
