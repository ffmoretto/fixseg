/** @type {import('next').NextConfig} */

// Cabeçalhos de segurança (LGPD / boas práticas).
// Nenhum dado sensível é exposto no frontend: chaves de integração ficam
// apenas em variáveis de ambiente do servidor (ver .env.example).
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Adicione aqui os domínios de onde as imagens virão (ex.: Supabase Storage).
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['gsap'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
