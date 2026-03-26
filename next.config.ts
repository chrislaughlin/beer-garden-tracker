import type { NextConfig } from 'next';

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const mapTilerOrigin = 'https://api.maptiler.com';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' }
];

const csp = [
  "default-src 'self'", 
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // tighten once third-party scripts known
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com" + (supabaseHostname ? ` https://${supabaseHostname}` : '') + ` ${mapTilerOrigin}`,
  "connect-src 'self'" + (process.env.NEXT_PUBLIC_SUPABASE_URL ? ` ${process.env.NEXT_PUBLIC_SUPABASE_URL}` : '') + ` ${mapTilerOrigin}`,
  `font-src 'self' data: ${mapTilerOrigin}`,
  "frame-ancestors 'none'"
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: csp }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      ...(supabaseHostname ? [{ protocol: 'https' as const, hostname: supabaseHostname }] : [])
    ]
  }
};

export default nextConfig;
