/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["alu-ui"],
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      "lh3.googleusercontent.com",
      "alu-user-uploads.nyc3.digitaloceanspaces.com",
      "alulearn.com",
    ],
  },
  webpack(config) {
    // https://react-svgr.com/docs/next/
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    // // Add support for importing TypeScript files
    // config.module.rules.push({
    //   test: /\.(ts|tsx)$/,
    //   use: [
    //     {
    //       loader: 'babel-loader',
    //       options: {
    //         presets: ['next/babel'],
    //       },
    //     },
    //     {
    //       loader: 'ts-loader',
    //       options: {
    //         transpileOnly: true,
    //       },
    //     },
    //   ],
    // });

    return config;
  },
};

module.exports = nextConfig;
