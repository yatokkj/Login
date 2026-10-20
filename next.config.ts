import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // better-sqlite3 is a native Node addon: keep it external so the server
  // bundler never tries to inline the .node binary.
  serverExternalPackages: ["better-sqlite3"],
  // Dev-only: allow the sandbox preview origin to fetch /_next/* assets.
  allowedDevOrigins: ["*.space-z.ai"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
