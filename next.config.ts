import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Allow Telegram GramJS and Playwright to run server-side
  serverExternalPackages: [
    'telegram',
    'playwright',
    'playwright-extra',
    'puppeteer-extra-plugin-stealth',
    '@prisma/client',
    'prisma',
  ],

  experimental: {
    // Increase body parser limit for image uploads
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native Node modules that ship binaries
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        'bufferutil',
        'utf-8-validate',
      ].filter(Boolean);
    }
    return config;
  },
};

export default nextConfig;
