/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/pricing', destination: '/announcements', permanent: true },
    ];
  },
};

export default nextConfig;
