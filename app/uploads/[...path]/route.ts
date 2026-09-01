import { NextResponse } from "next/server";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const strapi = (process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337").replace(/\/+$/, "");
  const alvo = `${strapi}/uploads/${path.map(encodeURIComponent).join("/")}`;

  const resposta = await fetch(alvo, { cache: "no-store" }).catch(() => null);
  if (!resposta?.ok) return new NextResponse(null, { status: 404 });

  return new NextResponse(resposta.body, {
    status: 200,
    headers: {
      "Content-Type": resposta.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
