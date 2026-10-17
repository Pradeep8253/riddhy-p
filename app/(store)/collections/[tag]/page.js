import { notFound } from 'next/navigation';
import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';

const TAG_META = {
  'best-selling': {
    title: 'Best Selling Furniture & Appliances',
    eyebrow: 'Most Loved · Customer Favourites',
    description: 'Explore the pieces Indian homes choose the most. Dependable designs, solid craftsmanship, and proven quality.'
  },
  popular: {
    title: 'Popular Collections',
    eyebrow: 'Community Choice · High Demand',
    description: 'Our most-viewed and shortlisted furniture and appliances, built for thoughtful living.'
  },
  trending: {
    title: 'Trending This Season',
    eyebrow: 'In High Demand · Style Forward',
    description: 'Modern silhouettes, space-conscious formats, and trending finishes for today’s homes.'
  },
  'new-arrival': {
    title: 'New Arrivals',
    eyebrow: 'Fresh in the Showroom',
    description: 'The latest additions to our furniture and appliance collections, crafted with thoughtful Indian proportions.'
  },
  featured: {
    title: 'Featured Collection',
    eyebrow: 'Editor’s Curated Selection',
    description: 'Hand-picked standout designs featuring signature materials, premium hardware, and comprehensive warranty.'
  },
  deal: {
    title: 'Exclusive Deals & Value Offers',
    eyebrow: 'Special Value · Limited Period',
    description: 'Room-ready furniture and branded appliances with exceptional seasonal pricing.'
  }
};

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const meta = TAG_META[tag] || {
    title: `${tag.replace(/-/g, ' ')} Collection`,
    description: 'Explore curated furniture and appliances at RF Riddhy.'
  };

  return {
    title: `${meta.title} | RF Riddhy`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | RF Riddhy`,
      description: meta.description
    }
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

  // Generate ItemList JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title,
    description: meta.description,
    numberOfItems: total,
    itemListElement: items.slice(0, 10).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `https://rfriddhy.com/product/${product.slug}`,
        image: product.image,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
