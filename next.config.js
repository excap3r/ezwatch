/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'prehraj.to', 'thumb.prehrajto.cz'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  experimental: {
    // Nastavíme staleTime pro dynamický obsah
    staleTimes: {
      dynamic: 10, // 10 sekund
    },
  },
}

module.exports = nextConfig 