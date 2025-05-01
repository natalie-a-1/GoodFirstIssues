/** @type {import("next").NextConfig} */
const nextConfig = {
  // React Strict Mode is recommended for identifying potential problems
  reactStrictMode: true,

  // ESLint and TypeScript error checking
  eslint: {
    // Set to false for production to ensure code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Set to false for production to ensure type safety
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

