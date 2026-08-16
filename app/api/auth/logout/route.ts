import { handleLogout } from "@/lib/auth/handlers";
import { jsonWithCookies, readTokenCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  return jsonWithCookies(await handleLogout(readTokenCookies(request), routeOptions(request)));
}
