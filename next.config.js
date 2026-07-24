/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Turbopack resolveAlias: silences Node.js native modules (fs, net, tls)
  // that may be imported by client-side bundles (e.g. PeerJS, Socket.IO).
  turbopack: {
    resolveAlias: {
      fs: { browser: './lib/empty.js' },
      net: { browser: './lib/empty.js' },
      tls: { browser: './lib/empty.js' },
    },
  },
};

module.exports = nextConfig;
