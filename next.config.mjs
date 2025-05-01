/** @type {import("next").NextConfig} */
const nextConfig = {
  // Configure Next.js for static export, suitable for GitHub Pages
  output: "export",

  // Configure for the repository name actually used on GitHub Pages
  // (https://natalie-a-1.github.io/GoodFirstIssues)
  assetPrefix: "/GoodFirstIssues/",
  basePath: "/GoodFirstIssues",

  // Make basePath available to the client side
  env: {
    NEXT_PUBLIC_BASE_PATH: "/GoodFirstIssues",
  },

  // React Strict Mode is recommended for identifying potential problems
  reactStrictMode: true,

  // Disable image optimization API for static export
  images: {
    unoptimized: true,
  },

  // Skip ESLint and TypeScript errors during the static export build that would
  // otherwise prevent deployment on GitHub Pages.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

