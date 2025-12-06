import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.APP_MODE === 'mobile' ? 'export' : undefined,
  // Disable image optimization for static export (required for 'export' mode)
  images: {
    unoptimized: process.env.APP_MODE === 'mobile',
  }
};

export default nextConfig;
