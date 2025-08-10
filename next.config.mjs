/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: [],
    unoptimized: true,
    // Removed overly permissive remote patterns for security
    // Add specific domains if remote images are needed
  },
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize for production
  swcMinify: true,
  // Compress output
  compress: true,
  // ESLint should be enforced during builds for code quality
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
}

export default nextConfig