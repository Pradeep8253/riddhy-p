import MarriagePackagesClient from "@/components/store/MarriagePackagesClient";
import { getLivePackages } from "@/lib/packages-data";
import { getCanonicalUrl, getBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Wedding Furniture Packages in Prayagraj | Complete Marriage Setup | RF Riddhy",
  description:
    "Explore 5 all-inclusive wedding furniture and appliance packages in Prayagraj & Mansoorabad: Shagun, Lagan, Kanyadaan, Griha Lakshmi & Bhagya Shree from ₹49,999 to ₹89,999 with double bed, almirah, sofa, cooler, fridge & free delivery.",
  keywords: [
    "wedding furniture packages in Prayagraj",
    "marriage furniture package in Prayagraj",
    "shagun furniture package Prayagraj",
    "wedding furniture and appliance combo in Prayagraj",
    "affordable furniture package in Prayagraj",
    "furniture showroom in Mansoorabad",
  ],
  alternates: {
    canonical: getCanonicalUrl("/marriage-packages"),
  },
  openGraph: {
    title: "Wedding Furniture Packages in Prayagraj | RF Riddhy",
    description:
      "All-inclusive wedding furniture & appliance packages in Prayagraj from ₹49,999. Double bed, almirah, sofa, appliances & kitchenware with free doorstep delivery.",
    url: getCanonicalUrl("/marriage-packages"),
    images: ["/images/og-image.webp"],
  },
};

export default async function MarriagePackagesDedicatedPage() {
  const rawPackages = await getLivePackages();
  const packages = JSON.parse(JSON.stringify(rawPackages));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Wedding Furniture Packages in Prayagraj - Riddhy Furnitures",
    description:
      "Complete 5 all-inclusive wedding furniture and appliance packages in Prayagraj.",
    itemListElement: packages.map((pkg, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: pkg.name,
      description: pkg.description,
      offers: {
        "@type": "Offer",
        price: pkg.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    })),
  };

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Wedding Packages", url: "/marriage-packages" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([schema, breadcrumbs]).replace(/</g, "\\u003c"),
        }}
      />
      <main>
        <MarriagePackagesClient packages={packages} />
      </main>
    </>
  );
}
