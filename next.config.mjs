/** @type {import("next").NextConfig} */
const nextConfig = {
  // Configure Next.js for static export, suitable for GitHub Pages
  output: "export",

  // Optional: If deploying to a subdirectory (e.g., https://username.github.io/repo-name/)
  // uncomment and set the assetPrefix and basePath.
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

