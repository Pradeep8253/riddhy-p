import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts } from "@/lib/catalogue";
import { getCanonicalUrl, getBreadcrumbSchema, getItemListSchema } from "@/lib/seo";

export const metadata = {
  title: "Home Appliances Shop in Prayagraj | Refrigerators, Washing Machines, Coolers",
  description:
    "Shop certified home appliances in Prayagraj & Mansoorabad: branded refrigerators, washing machines, desert coolers, smart LED TVs, mixer grinders & air conditioners with official brand warranty and doorstep delivery.",
  keywords: [
    "home appliances shop in Prayagraj",
    "refrigerator shop in Prayagraj",
    "washing machine in Prayagraj",
    "cooler shop in Prayagraj",
    "appliances showroom Mansoorabad",
    "home appliances Prayagraj Uttar Pradesh",
  ],
  alternates: {
    canonical: getCanonicalUrl("/appliances"),
  },
  openGraph: {
    title: "Home Appliances in Prayagraj | Riddhy Furnitures",
    description:
      "Shop certified home appliances in Prayagraj with brand warranty and free delivery.",
    url: getCanonicalUrl("/appliances"),
    images: ["/images/og-image.webp"],
  },
};

export default async function AppliancesPage() {
  const { items, total } = await getProducts({ type: "appliance", limit: 48 });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Appliances", url: "/appliances" },
  ]);

  const itemList = getItemListSchema(
    items,
    "Home Appliances in Prayagraj",
    "Reliable home appliances with brand warranty at Riddhy Furnitures Prayagraj."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbs, itemList]).replace(/</g, "\\u003c"),
        }}
      />
      <ListingHeader
        eyebrow="Appliance precision studio · Prayagraj"
        title="Power the everyday."
        description="Compare capacity, star energy ratings, dimensions and brand warranty with clear, honest pricing in Prayagraj."
        count={total}
      />
      <CatalogShell
        products={items}
        title="Home appliance collection"
        description="Find the right fit for your home with doorstep delivery and installation."
      />
    </>
  );
}
