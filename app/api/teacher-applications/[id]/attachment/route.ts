import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { canReviewTeachers } from "@/lib/auth/roles";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";
import { parseApplicationId } from "../[action]/route";

const FORWARDED_HEADERS = ["content-type", "content-disposition", "content-length"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseApplicationId((await params).id);
  if (!id) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 });

  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (!canReviewTeachers(session.user.role?.type)) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const upstream = await createTeacherApplicationsClient().downloadAttachment(accessToken, id);
  if (!upstream) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  for (const name of FORWARDED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response = new NextResponse(upstream.body, { status: 200, headers });
  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
