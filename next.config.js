/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.BUILD_TARGET === 'mobile' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
  images: {
    unoptimized: process.env.BUILD_TARGET === 'mobile',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
