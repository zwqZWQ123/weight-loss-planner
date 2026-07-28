import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/weight-loss-planner',
  images: { unoptimized: true },
};

export default nextConfig;
