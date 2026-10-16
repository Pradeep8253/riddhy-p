import MarriagePackagesClient from '@/components/store/MarriagePackagesClient';
import { getLivePackages } from '@/lib/packages-data';
import { siteConfig } from '@/lib/site-config';

export const metadata = {
  title: 'Marriage Packages & Complete Home Setups — RF Riddhy',
  description:
    'Curated wedding furniture and home appliance packages for newly married couples. Essential, Premium, and Luxury collections with transparent pricing and customizable selections.',
  alternates: {
    canonical: `${siteConfig.siteUrl}/packages`
  }
};

export default async function MarriagePackagesPage() {
  const rawPackages = await getLivePackages();
  const packages = JSON.parse(JSON.stringify(rawPackages));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RF Riddhy Marriage Packages',
    description: 'Complete wedding furniture and appliance packages.',
    itemListElement: packages.map((pkg, idx) => ({
      '@type': 'Product',
      position: idx + 1,
      name: pkg.name,
      description: pkg.description,
      offers: {
        '@type': 'Offer',
        price: pkg.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <main>
        <MarriagePackagesClient packages={packages} />
      </main>
    </>
  );
}
