import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Webpack aliases to resolve local Kaizen UI package (fixes Docker pnpm symlink issues)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@kui/foundations-react-external": path.resolve(
        __dirname,
        "kui-foundations-react-external"
      ),
    };
    return config;
  },
};

export default nextConfig;
