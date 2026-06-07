import type { NextConfig } from 'next'

const appwriteHostname = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? 'https://200.129.85.133:8443/v1',
).hostname

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: appwriteHostname,
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
export default nextConfig
