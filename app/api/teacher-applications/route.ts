import { NextResponse } from "next/server";
import { readTokenCookies } from "@/app/api/auth/_shared";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type TeacherApplicationStatus = (typeof VALID_STATUSES)[number];

export function parseStatusParam(value: string | null): TeacherApplicationStatus | undefined {
  return value && (VALID_STATUSES as readonly string[]).includes(value) ? (value as TeacherApplicationStatus) : undefined;
}

export async function GET(request: Request) {
  const { accessToken } = readTokenCookies(request);
  if (!accessToken) return NextResponse.json({ ok: false, data: [] }, { status: 401 });

  const status = parseStatusParam(new URL(request.url).searchParams.get("status"));
  const data = await createTeacherApplicationsClient().list(accessToken, status);
  return NextResponse.json({ ok: true, data });
}
