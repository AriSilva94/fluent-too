import { handleLogin } from "@/lib/auth/handlers";
import { jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  return jsonWithCookies(await handleLogin(request, routeOptions(request)));
}
