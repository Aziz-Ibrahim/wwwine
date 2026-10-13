/** @type {import('next').NextConfig} */
const regionRedirects = require('./src/lib/region-redirects.json')
const nextConfig = {
  async redirects() {
    return Object.entries(regionRedirects).map(([id, destination]) => ({
      source: `/regions/${id}`,
      destination: `/regions/${destination}`,
      permanent: true,
    }))
  },
  reactStrictMode: true,
  // Move build output outside OneDrive-synced folder to avoid EINVAL symlink errors on Windows
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    typedRoutes: true,
    // Disable worker threads — OneDrive file locking conflicts with Next.js parallel writes
    workerThreads: false,
    cpus: 1,
  },
  images: {
    unoptimized: false,
  },
}

module.exports = nextConfig
