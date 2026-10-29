import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';
import { getCanonicalUrl, getBreadcrumbSchema, getItemListSchema } from '@/lib/seo';

export const metadata = {
  title: 'All Products — Furniture & Home Appliances in Prayagraj | RF Riddhy',
  description:
    'Explore complete furniture, home appliances, and kitchenware catalog at RF Riddhy Prayagraj & Mansoorabad (229411). Living, bedroom, dining, kitchen essentials, and marriage packages with free delivery.',
  keywords: [
    'furniture catalog Prayagraj',
    'furniture shop in Prayagraj',
    'home appliances in Prayagraj',
    'kitchen utensils Prayagraj',
    'Riddhy Furnitures products',
  ],
  alternates: {
    canonical: getCanonicalUrl('/products'),
  },
  openGraph: {
    title: 'All Products — Riddhy Furnitures Prayagraj',
    description:
      'Complete furniture, home appliances, and kitchenware catalog with free delivery in Prayagraj.',
    url: getCanonicalUrl('/products'),
    images: ['/images/og-image.webp'],
  },
};

export default async function ProductsPage() {
  const { items, total } = await getProducts({ limit: 96 });

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
  ]);

  const itemList = getItemListSchema(
    items,
    'All Products at Riddhy Furnitures Prayagraj',
    'Full catalog of furniture, home appliances, and utensils.'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbs, itemList]).replace(/</g, '\\u003c'),
        }}
      />
      <ListingHeader
        eyebrow="Complete Home Catalog · Prayagraj"
        title="Furniture & Appliances Crafted for Real Life."
        description="Explore solid teak and sheesham wood craftsmanship, certified home appliances, and complete wedding packages from our showroom in Mansoorabad, Prayagraj."
        count={total}
      />
      <CatalogShell
        products={items}
        title="All Products"
        description="Filter by room, category, price, and brand."
      />
    </>
  );
}
