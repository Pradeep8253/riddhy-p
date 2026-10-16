import { getDemoProducts } from '@/lib/demo-data';

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const staticRoutes = ['', '/furniture', '/appliances', '/offers', '/about', '/contact', '/faq', '/bulk-enquiry', '/policies/shipping', '/policies/returns', '/policies/warranty', '/policies/privacy', '/policies/terms'];
  const products = getDemoProducts().map((product) => `/product/${product.slug}`);
  return [...staticRoutes, ...products].map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'daily' : 'weekly', priority: route === '' ? 1 : .7 }));
}
