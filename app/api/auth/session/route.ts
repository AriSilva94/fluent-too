import { handleSession } from "@/lib/auth/handlers";
import { jsonWithCookies, readTokenCookies, routeOptions, enforceRateLimit } from "../_shared";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, { name: "refresh", limit: 30, windowSeconds: 300 });
  if (limited) return limited;

  const options = routeOptions(request);
  return jsonWithCookies(await handleSession(readTokenCookies(request), options));
}
