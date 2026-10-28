export default function robots() {
  const base = 'https://www.riddhyfurnitures.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/api/admin',
          '/api/admin/*',
          '/checkout',
          '/checkout/*',
          '/cart',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Amazonbot',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/api/*',
          '/checkout',
          '/checkout/*',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
