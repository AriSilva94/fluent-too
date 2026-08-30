import { handleResetPassword } from "@/lib/auth/handlers";
import { enforceRateLimit, jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { name: "reset-password", limit: 10, windowSeconds: 3600 });
  if (limited) return limited;

  return jsonWithCookies(await handleResetPassword(request, routeOptions(request)));
}
