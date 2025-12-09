const nextConfig = {
  /* config options here */
  experimental: {
    inlineCss: true,
    clientSegmentCache: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add your image hosting domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
};

export default nextConfig;
