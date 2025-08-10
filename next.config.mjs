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
  // ESLint should be enforced during builds for code quality
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
}

export default nextConfig