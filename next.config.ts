import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for a small Docker image on Dokploy.
  output: 'standalone',
  // Allow remote images when you connect to a CDN or API; add hostnames as needed.
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "example.com", pathname: "/media/**" },
  //   ],
  // },
  // `/open-hr` was the working path for this page before it moved to the site
  // root. Kept as a 307 rather than a 308 — a permanent redirect is cached by
  // browsers more or less forever, which would make the path unreclaimable if
  // it ever becomes a real page.
  async redirects() {
    return [
      { source: '/open-hr', destination: '/', permanent: false },
      { source: '/open-hr/success', destination: '/success', permanent: false },
    ]
  },
  // Dev only: proxy /api/v1 to the staging API so the browser sees a same-origin
  // request and CORS never applies. Pair with NEXT_PUBLIC_API_BASE_URL=/api/v1.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    const target = process.env.DEV_API_PROXY_TARGET ?? 'https://api.staging.tryopenhr.com'
    return [{ source: '/api/v1/:path*', destination: `${target}/api/v1/:path*` }]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
