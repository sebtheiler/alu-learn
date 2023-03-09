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
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzerConf = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE_BUNDLE_SIZE === "true",
});

module.exports = withBundleAnalyzerConf(nextConfig);
