import { handleForgotPassword } from "@/lib/auth/handlers";
import { jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  return jsonWithCookies(await handleForgotPassword(request, routeOptions(request)));
}
