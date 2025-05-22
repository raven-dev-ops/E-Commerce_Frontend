import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'export', // ✅ Needed for Netlify static hosting

  env: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  },

  webpack(config) {
    if (!config.externals) config.externals = [];
    if (!config.externals.includes('@types/react')) {
      config.externals.push('@types/react');
    }
    return config;
  },
};

export default nextConfig;
