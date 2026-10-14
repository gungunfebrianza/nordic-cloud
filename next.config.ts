import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Two root layouts ((en) and (da)) leave no single layout for the 404; this renders its own.
  experimental: { globalNotFound: true },
};

export default nextConfig;
