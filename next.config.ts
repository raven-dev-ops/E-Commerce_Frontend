import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  webpack(config, options) {
    // Add '@types/react' as external to avoid bundling issues
    if (!config.externals) {
      config.externals = [];
    }
    
    // Add @types/react as external if not already present
    if (!config.externals.includes("@types/react")) {
      config.externals.push("@types/react");
    }

    return config;
  },
};

export default nextConfig;
