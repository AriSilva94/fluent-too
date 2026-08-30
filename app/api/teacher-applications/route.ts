import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type TeacherApplicationStatus = (typeof VALID_STATUSES)[number];

export function parseStatusParam(value: string | null): TeacherApplicationStatus | undefined {
  return value && (VALID_STATUSES as readonly string[]).includes(value) ? (value as TeacherApplicationStatus) : undefined;
}

export async function GET(request: Request) {
  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (session.status === "anonymous") return NextResponse.json({ ok: false, data: [] }, { status: 401 });

  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, data: [] }, { status: 401 });

  const status = parseStatusParam(new URL(request.url).searchParams.get("status"));
  const result = await createTeacherApplicationsClient().list(accessToken, status);

  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  if (session.status === "refreshed") {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
