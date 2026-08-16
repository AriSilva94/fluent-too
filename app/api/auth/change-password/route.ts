import { handleChangePassword } from "@/lib/auth/handlers";
import { jsonWithCookies, readTokenCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  return jsonWithCookies(await handleChangePassword(request, readTokenCookies(request), routeOptions(request)));
}
