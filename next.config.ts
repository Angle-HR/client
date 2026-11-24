import createMDX from '@next/mdx'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for a small Docker image on Dokploy.
  output: 'standalone',
  // The live design-system docs at /docs are written in MDX (app/docs/**/page.mdx).
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Allow remote images when you connect to a CDN or API; add hostnames as needed.
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "example.com", pathname: "/media/**" },
  //   ],
  // },
  // Dev only: proxy /api/v1 to the staging API so the browser sees a same-origin
  // request and CORS never applies. Pair with NEXT_PUBLIC_API_BASE_URL=/api/v1.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    const target = process.env.DEV_API_PROXY_TARGET ?? 'https://api.staging.tryopenhr.com'
    return [{ source: '/api/v1/:path*', destination: `${target}/api/v1/:path*` }]
  },
  // The app's root is not a page: signed-in users go to the dashboard, and the dashboard layout sends anyone without
  // a session on to /login. /privacy is the address the terms text uses for the privacy policy.
  async redirects() {
    return [
      { source: '/', destination: '/dashboard', permanent: false },
      { source: '/privacy', destination: '/privacy-policy', permanent: false },
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
      // Pages that carry or follow a secret (reset token, email being verified, invite token):
      // never send a Referer. Listed after the catch-all so this value wins.
      ...['/reset-password', '/verify', '/invite', '/invite/join'].map((source) => ({
        source,
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      })),
    ]
  },
}

// Plugins are named as strings so Turbopack can pass them to the MDX loader.
const withMDX = createMDX({ options: { remarkPlugins: [['remark-gfm']] } })

export default withMDX(nextConfig)
