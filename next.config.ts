import type { NextConfig } from 'next'
import path from 'node:path'
import webpack from 'webpack'

const appwriteHostname = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? 'https://procuraai-homolog.secties.pb.gov.br/v1',
).hostname

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^isomorphic-form-data$/,
        path.resolve(process.cwd(), 'form-data-mock.js'),
      ),
    )
    return config
  },
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
