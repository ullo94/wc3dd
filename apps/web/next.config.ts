import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@wc3dd/db", "@wc3dd/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
