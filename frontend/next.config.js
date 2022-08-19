/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "d1whtlypfis84e.cloudfront.net",
      "www.mooc.org",
      "d2v9ipibika81v.cloudfront.net",
      "thumbs.dreamstime.com",
      "encrypted-tbn0.gstatic.com",
    ],
  },
};

module.exports = nextConfig;
