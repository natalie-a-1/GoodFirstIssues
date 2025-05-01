/** @type {import("next").NextConfig} */
const nextConfig = {
  // Configure Next.js for static export, suitable for GitHub Pages
  output: "export",

  // Since we're deploying to the custom domain good.first.issue
  // We don't need assetPrefix and basePath for custom domains
  // If deploying to GitHub's default domain, uncomment these:
  // assetPrefix: "/crypto-good-first-issues/",
  // basePath: "/crypto-good-first-issues",

  // React Strict Mode is recommended for identifying potential problems
  reactStrictMode: true,

  // Disable image optimization API for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

