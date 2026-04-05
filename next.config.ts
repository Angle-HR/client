import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow remote images when you connect to a CDN or API; add hostnames as needed.
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "example.com", pathname: "/media/**" },
  //   ],
  // },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
