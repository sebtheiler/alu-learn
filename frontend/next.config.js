/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "alu-user-uploads.nyc3.digitaloceanspaces.com",
      "alulearn.com",
    ],
  },
};

module.exports = nextConfig;
