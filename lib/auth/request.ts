export function isTrustedOrigin(origin: string | null, siteUrl: string) {
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export function getSiteUrl(request?: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}

export async function readLimitedJson(request: Request, maxBytes = 16 * 1024) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}
