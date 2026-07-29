import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Allow the Next.js dev server (HMR/RSC internals) to be reached from the
  // public host it is deployed on. Without this, hydration silently fails when
  // the app is opened over a non-localhost origin (e.g. the server's public IP).
  allowedDevOrigins: ['150.109.243.65', '127.0.0.1'],
};

export default nextConfig;
