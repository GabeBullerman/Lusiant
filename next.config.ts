import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'lusiant.co',
        pathname: '/cdn/**',
      },
    ],
  },
}

export default nextConfig
