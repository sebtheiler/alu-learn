/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["alu-ui"],
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig;
