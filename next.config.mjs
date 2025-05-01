/** @type {import("next").NextConfig} */
const nextConfig = {
  // Configure Next.js for static export, suitable for GitHub Pages
  output: "export",

  // Since we're using the free GitHub Pages URL, we need to set these
  assetPrefix: "/crypto-good-first-issues/",
  basePath: "/crypto-good-first-issues",

  // Make basePath available to the client side
  env: {
    NEXT_PUBLIC_BASE_PATH: "/crypto-good-first-issues",
  },

  // React Strict Mode is recommended for identifying potential problems
  reactStrictMode: true,

  // Disable image optimization API for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

