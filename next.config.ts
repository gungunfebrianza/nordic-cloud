import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT) {
  console.warn(
    "⚠ NEXT_PUBLIC_SIGNUP_ENDPOINT is not set: #cta sign-ups go nowhere (the form still shows success).",
  );
}

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
