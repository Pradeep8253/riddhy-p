/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
      '*.vert': { loaders: ['raw-loader'], as: '*.js' },
      '*.frag': { loaders: ['raw-loader'], as: '*.js' }
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [
      { pathname: '/**' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*'
      }
    ];
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' }
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://api.razorpay.com",
      "frame-src 'self' https://api.razorpay.com https://accounts.google.com",
      "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://res.cloudinary.com https://api.cloudinary.com https://accounts.google.com https://raw.githubusercontent.com https://cdn.jsdelivr.net",
      "media-src 'self' https://res.cloudinary.com blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.razorpay.com"
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspDirectives }
        ]
      }
    ];
  }
};

export default nextConfig;
// Dev server reload timestamp: 2026-10-28T00:06:00
