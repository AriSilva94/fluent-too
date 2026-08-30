import { handleRegister } from "@/lib/auth/handlers";
import { enforceRateLimit, jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { name: "register", limit: 5, windowSeconds: 3600 });
  if (limited) return limited;

  return jsonWithCookies(await handleRegister(request, routeOptions(request)));
}
