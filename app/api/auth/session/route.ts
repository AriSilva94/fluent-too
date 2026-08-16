import { handleSession } from "@/lib/auth/handlers";
import { jsonWithCookies, readTokenCookies, routeOptions } from "../_shared";

export async function GET(request: Request) {
  const options = routeOptions(request);
  return jsonWithCookies(await handleSession(readTokenCookies(request), options));
}
