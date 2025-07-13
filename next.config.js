/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['via.placeholder.com', 'placehold.co'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    // Suppress Critical dependency warning for @supabase/realtime-js
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@supabase[\\/]realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

module.exports = nextConfig;
