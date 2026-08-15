/** @type {import('next').NextConfig} */
const isMobile = process.env.BUILD_TARGET === 'mobile'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://plus.unsplash.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com",
      "frame-src https://www.openstreetmap.org",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://unpkg.com",
      "media-src 'self' https://*.supabase.co blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  ...(isMobile ? { output: 'export', trailingSlash: true } : {}),

  // Security headers (web only — ignored in static export)
  ...(!isMobile ? {
    async headers() {
      return [{ source: '/(.*)', headers: securityHeaders }]
    },
  } : {}),

  images: {
    unoptimized: isMobile,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Compress responses
  compress: true,

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ['leaflet'],
  },
}

module.exports = nextConfig
