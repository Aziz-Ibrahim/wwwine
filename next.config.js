/** @type {import('next').NextConfig} */
const nextConfig = {
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
