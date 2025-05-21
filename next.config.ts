import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'export', // ✅ Needed for Netlify static hosting

  webpack(config) {
    if (!config.externals) config.externals = [];
    if (!config.externals.includes('@types/react')) {
      config.externals.push('@types/react');
    }
    return config;
  },
};

export default nextConfig;
