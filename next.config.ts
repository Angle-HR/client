import type { NextConfig } from 'next'

// Local dev only: origin that `/api/v1/*` is proxied to, e.g.
// https://api.staging.tryopenhr.com. The API's CORS allow-list doesn't include
// localhost:3000, so locally the browser calls same-origin and Next forwards.
// Deployed builds leave this unset and call the API directly.
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for a small Docker image on Dokploy.
  output: 'standalone',
  // Allow remote images when you connect to a CDN or API; add hostnames as needed.
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "example.com", pathname: "/media/**" },
  //   ],
  // },
  // The dashboard is the main route; the waitlist lives at `/waitlist`.
  // `/open-hr` and `/success` were earlier paths for the waitlist. All 307s
  // rather than 308s — a permanent redirect is cached by browsers more or
  // less forever, which would make the paths unreclaimable.
  async redirects() {
    return [
      { source: '/', destination: '/dashboard', permanent: false },
      { source: '/open-hr', destination: '/waitlist', permanent: false },
      { source: '/open-hr/success', destination: '/waitlist/success', permanent: false },
      { source: '/success', destination: '/waitlist/success', permanent: false },
    ]
  },
  // With NEXT_PUBLIC_API_BASE_URL=/api/v1 the browser calls same-origin and
  // Next forwards to the backend, sidestepping CORS.
  async rewrites() {
    if (!apiProxyTarget) return []
    return [{ source: '/api/v1/:path*', destination: `${apiProxyTarget}/api/v1/:path*` }]
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
