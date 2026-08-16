import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
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
    ],
  },
};

export default nextConfig;
