/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["alu-ui", "lexical-editor"],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
