import { handleLogin } from "@/lib/auth/handlers";
import { enforceRateLimit, jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { name: "login", limit: 10, windowSeconds: 300 });
  if (limited) return limited;

  return jsonWithCookies(await handleLogin(request, routeOptions(request)));
}
