import { handleRegister } from "@/lib/auth/handlers";
import { jsonWithCookies, routeOptions } from "../_shared";

export async function POST(request: Request) {
  return jsonWithCookies(await handleRegister(request, routeOptions(request)));
}
