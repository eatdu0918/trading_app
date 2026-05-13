import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ['@trading-app/core', '@trading-app/datafeed', '@trading-app/ui'],
};

export default config;
