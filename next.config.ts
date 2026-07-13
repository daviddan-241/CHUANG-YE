import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No 'standalone' output — Render's native Node runtime uses `next start` directly

  // Keep heavy server-only packages out of the webpack bundle
  serverExternalPackages: [
    'telegram',
    'playwright',
    'playwright-extra',
    'puppeteer-extra-plugin-stealth',
    '@prisma/client',
    'prisma',
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Playwright ships optional native bindings — keep them external
      const extra = ['bufferutil', 'utf-8-validate'];
      if (Array.isArray(config.externals)) {
        config.externals.push(...extra);
      } else if (typeof config.externals === 'function') {
        const orig = config.externals;
        config.externals = (ctx: any, cb: any) => {
          if (extra.includes(ctx.request)) return cb(null, `commonjs ${ctx.request}`);
          return orig(ctx, cb);
        };
      } else {
        config.externals = [...(config.externals ? [config.externals] : []), ...extra];
      }
    }
    return config;
  },
};

export default nextConfig;
