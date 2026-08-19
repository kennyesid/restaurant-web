/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: ['192.168.1.3'],
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
