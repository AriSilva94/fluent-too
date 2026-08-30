import type { NextConfig } from "next";

// Content-Security-Policy não mora aqui: precisa de um nonce por requisição
// (script-src sem 'unsafe-inline'), então é montada no Proxy (`lib/security/csp.ts`)
// e só se aplica às rotas de página. Duplicar um CSP estático aqui além do dinâmico
// do Proxy faria o navegador reforçar as duas ao mesmo tempo e barrar os próprios
// scripts do Next por não terem o nonce da política estática.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS só faz sentido atrás de HTTPS; em dev local (http) o header é inofensivo mas
  // inútil, então mandamos mesmo assim porque produção é sempre HTTPS aqui.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn-dev.fluent-too.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fluent-too.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
    ],
  },
};

export default nextConfig;
