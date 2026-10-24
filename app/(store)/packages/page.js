import MarriagePackagesClient from '@/components/store/MarriagePackagesClient';
import { getLivePackages } from '@/lib/packages-data';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Our Packages — RF Riddhy Furnitures & Home Appliances',
  description:
    'Explore our 5 all-inclusive wedding and home setup packages: Shagun, Lagan, Kanyadaan, Griha Lakshmi, and Bhagya Shree from ₹49,999 to ₹89,999 with complete bedroom, living, dining, and home appliances.',
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
    name: 'RF Riddhy - Our Packages',
    description: 'Complete 5 all-inclusive wedding furniture and appliance packages.',
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
