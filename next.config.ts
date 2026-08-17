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
