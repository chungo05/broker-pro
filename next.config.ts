import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack options in Next.js 16
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
