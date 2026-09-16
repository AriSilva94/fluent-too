export const CLIENT_IP_HEADER = "X-Fluent-Client-Ip";
export const INTERNAL_SECRET_HEADER = "X-Fluent-Internal-Secret";

type HeaderSource = { get(name: string): string | null };

export function resolveRequestClientIp(headers: HeaderSource): string | null {
  const cloudflare = headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;

  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return headers.get("x-real-ip")?.trim() || null;
}

export function buildClientIpHeaders(
  clientIp: string | null | undefined,
  secret = process.env.INTERNAL_PROXY_SECRET
): Record<string, string> {
  if (!clientIp || !secret) return {};
  return { [CLIENT_IP_HEADER]: clientIp, [INTERNAL_SECRET_HEADER]: secret };
}
