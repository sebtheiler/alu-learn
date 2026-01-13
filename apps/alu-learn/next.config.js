const dotenv = require("dotenv");

dotenv.config();
const DEBUG = (process.env.DEBUG || "false").toLowerCase() === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["alu-ui", "lexical-editor"],
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      "lh3.googleusercontent.com",
      "alu-user-uploads.nyc3.digitaloceanspaces.com",
      "alulearn.com",
      "useruploads.alulearn.com",
    ],
  },
  webpack(config) {
    // https://react-svgr.com/docs/next/
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  typescript: {
    // Ignores build errors when building for production on the server
    // Type validation takes a lot of RAM, leading to an OOM error when building in prod
    // Still validates types locally
    ignoreBuildErrors: DEBUG ? false : true,
  },
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzerConf = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE_BUNDLE_SIZE === "true",
});

module.exports = withBundleAnalyzerConf(nextConfig);
