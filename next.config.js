/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    // local /public images are always allowed — no domains needed
    unoptimized: false,
  },
}

module.exports = nextConfig
