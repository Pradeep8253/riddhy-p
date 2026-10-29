import OffersClient from "@/components/store/OffersClient";
import { getCanonicalUrl, getBreadcrumbSchema } from "@/lib/seo";

export const metadata = {
  title: "Special Offers & Deals in Prayagraj | RF Riddhy",
  description:
    "Explore exclusive discounts, festive deals, and package pricing on solid wood furniture and home appliances in Prayagraj & Mansoorabad from Riddhy Furnitures.",
  keywords: [
    "furniture offers Prayagraj",
    "furniture discounts Prayagraj",
    "home appliances offers Prayagraj",
    "wedding package discount Prayagraj",
    "Riddhy Furnitures deals",
  ],
  alternates: {
    canonical: getCanonicalUrl("/offers"),
  },
  openGraph: {
    title: "Special Offers & Deals | Riddhy Furnitures Prayagraj",
    description:
      "Exclusive discounts and seasonal offers on furniture and home appliances in Prayagraj.",
    url: getCanonicalUrl("/offers"),
    images: ["/images/og-image.webp"],
  },
};

export default function OffersPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Special Offers", url: "/offers" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <OffersClient />
    </>
  );
}
