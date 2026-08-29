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
    // Os hosts abaixo são as fotos de perfil de quem avalia a corretora no
    // Google — a mesma lista está em src/services/googleReviews.ts
    // (HOSTS_DE_FOTO), que descarta qualquer URL fora dela. As duas precisam
    // combinar: o adaptador filtra, o Next autoriza.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'streetviewpixels-pa.googleapis.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['gsap'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
