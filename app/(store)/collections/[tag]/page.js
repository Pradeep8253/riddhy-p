import { notFound } from 'next/navigation';
import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';
import { getCanonicalUrl, getBreadcrumbSchema, SITE_URL } from '@/lib/seo';

const TAG_META = {
  'best-selling': {
    title: 'Best Selling Furniture & Appliances in Prayagraj',
    eyebrow: 'Most Loved · Customer Favourites',
    description: 'Explore the pieces Indian homes choose the most. Dependable designs, solid craftsmanship, and proven quality with doorstep delivery in Prayagraj.'
  },
  popular: {
    title: 'Popular Furniture Collections in Prayagraj',
    eyebrow: 'Community Choice · High Demand',
    description: 'Our most-viewed and shortlisted furniture and appliances, built for thoughtful living in Prayagraj & Mansoorabad.'
  },
  trending: {
    title: 'Trending Furniture This Season in Prayagraj',
    eyebrow: 'In High Demand · Style Forward',
    description: 'Modern silhouettes, space-conscious formats, and trending finishes for today’s homes in Prayagraj.'
  },
  'new-arrival': {
    title: 'New Arrival Furniture in Prayagraj',
    eyebrow: 'Fresh in the Showroom',
    description: 'The latest additions to our furniture and appliance collections, crafted with thoughtful Indian proportions.'
  },
  featured: {
    title: 'Featured Collection | Riddhy Furnitures Prayagraj',
    eyebrow: 'Editor’s Curated Selection',
    description: 'Hand-picked standout designs featuring signature materials, premium hardware, and comprehensive warranty.'
  },
  deal: {
    title: 'Exclusive Deals & Furniture Offers in Prayagraj',
    eyebrow: 'Special Value · Limited Period',
    description: 'Room-ready furniture and branded appliances with exceptional seasonal pricing in Prayagraj & Mansoorabad.'
  }
};

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const meta = TAG_META[tag] || {
    title: `${tag.replace(/-/g, ' ')} Collection`,
    description: 'Explore curated furniture and appliances at RF Riddhy.'
  };

  const canonical = getCanonicalUrl(`/collections/${tag}`);

  return {
    title: `${meta.title} | Riddhy Furnitures`,
    description: meta.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${meta.title} | Riddhy Furnitures Prayagraj`,
      description: meta.description,
      url: canonical,
      images: ['/images/og-image.webp'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Riddhy Furnitures Prayagraj`,
      description: meta.description,
      images: ['/images/og-image.webp'],
    },
  };
}

export default async function CollectionTagPage({ params }) {
  const { tag } = await params;
  const meta = TAG_META[tag] || {
    title: tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    eyebrow: 'Curated Collection',
    description: 'Handpicked products from RF Riddhy.'
  };

  const { items, total } = await getProducts({ tag, limit: 48 });

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Collections', url: `/collections/${tag}` },
    { name: meta.title, url: `/collections/${tag}` },
  ]);

  // Generate ItemList JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title,
    description: meta.description,
    numberOfItems: total,
    itemListElement: items.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `${SITE_URL}/product/${product.slug}`,
        image: product.image?.startsWith('http') ? product.image : `${SITE_URL}${product.image || '/images/og-image.webp'}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbs, jsonLd]).replace(/</g, '\\u003c'),
        }}
      />
      <ListingHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        count={total}
      />
      <CatalogShell
        products={items}
        title={meta.title}
        description="Filter by price, category, room, or dimensions to find your perfect fit."
      />
    </>
  );
}
