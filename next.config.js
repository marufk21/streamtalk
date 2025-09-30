/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 15 - opt into default caching for fetch requests
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // Configure for Socket.IO
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
