import { handleForgotPassword } from "@/lib/auth/handlers";
import { enforceRateLimit, jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { name: "forgot-password", limit: 5, windowSeconds: 3600 });
  if (limited) return limited;

  return jsonWithCookies(await handleForgotPassword(request, routeOptions(request)));
}
