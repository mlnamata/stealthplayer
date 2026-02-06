/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'i.ytimg.com'],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  webpack: (config, { dev, isServer }) => {
    // Suppress cross-origin errors from iframe
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
}

module.exports = nextConfig
