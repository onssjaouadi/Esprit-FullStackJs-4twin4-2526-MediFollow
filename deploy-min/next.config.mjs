// import { withSentryConfig } from "@sentry/nextjs";  // Temporarily disabled
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disable SWC to avoid Windows binary issues
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark Node.js-specific modules as external for server builds
      config.externals = config.externals || [];

      // Handle got as ESM module
      if (Array.isArray(config.externals)) {
        config.externals.push("got");
      } else {
        config.externals = [...config.externals, "got"];
      }
    }
    return config;
  },
  // Ensure experimental features are enabled for server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// Temporarily disabled Sentry for build validation
// export default withSentryConfig(nextConfig, {
export default nextConfig;

/*
// Original Sentry config would go here
// To re-enable Sentry, fix the SENTRY_AUTH_TOKEN env var and uncomment the original export
*/
