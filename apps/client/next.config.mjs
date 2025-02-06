/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  transpilePackages: ["@repo/ui"],
  reactStrictMode: true,
}

export default nextConfig
