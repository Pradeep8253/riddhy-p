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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' }
  }
};

export default nextConfig;
