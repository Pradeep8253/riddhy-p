import WarrantyPortalClient from '@/components/store/WarrantyPortalClient';
import { getLiveSiteConfig } from '@/lib/server-config';

export async function generateMetadata() {
  const config = await getLiveSiteConfig();
  const brand = config?.brandName || 'RF Riddhy';

  return {
    title: `Warranty Registration & Status | ${brand} Furniture & Home Appliances`,
    description:
      'Register your purchased RF Riddhy furniture and home appliances. Track real-time remaining warranty days, view coverage certificates, and request warranty service online.',
    alternates: {
      canonical: '/warranty'
    },
    openGraph: {
      title: `Warranty Registration & Protection | ${brand}`,
      description:
        'Verify authentic RF Riddhy coverage, check real-time remaining warranty days, and register newly delivered furniture and appliances.'
    }
  };
}

export default function WarrantyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'RF Riddhy Product Warranty & Protection Program',
    provider: {
      '@type': 'FurnitureStore',
      name: 'RF Riddhy – Furniture & Home Appliances'
    },
    description:
      'Official product warranty registration, certificate lookup, and remaining term calculation for RF Riddhy home appliances and solid wood furniture.',
    areaServed: 'IN'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WarrantyPortalClient />
    </>
  );
}
