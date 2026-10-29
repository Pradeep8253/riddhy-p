import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts } from "@/lib/catalogue";
import { getCanonicalUrl, getBreadcrumbSchema, getItemListSchema } from "@/lib/seo";

export const metadata = {
  title: "Furniture Showroom in Prayagraj | Solid Wood Beds, Sofas & Almirahs",
  description:
    "Explore handcrafted solid wood double beds, luxury sofa sets, wardrobes, dining tables, dressing tables and mattresses in Prayagraj & Mansoorabad (229411). Free doorstep delivery, 10-year frame warranty.",
  keywords: [
    "furniture shop in Prayagraj",
    "furniture showroom in Prayagraj",
    "sofa shop in Prayagraj",
    "double bed in Prayagraj",
    "wooden bed in Prayagraj",
    "almirah shop in Prayagraj",
    "dressing table in Prayagraj",
    "furniture store Mansoorabad",
  ],
  alternates: {
    canonical: getCanonicalUrl("/furniture"),
  },
  openGraph: {
    title: "Furniture Showroom in Prayagraj | Riddhy Furnitures",
    description:
      "Handcrafted solid wood double beds, sofa sets, almirahs & dining sets in Prayagraj. Doorstep delivery & assembly.",
    url: getCanonicalUrl("/furniture"),
    images: ["/images/og-image.webp"],
  },
};

export default async function FurniturePage() {
  const { items, total } = await getProducts({ type: "furniture", limit: 48 });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Furniture", url: "/furniture" },
  ]);

  const itemList = getItemListSchema(
    items,
    "Furniture Collection in Prayagraj",
    "Handcrafted furniture designs available at Riddhy Furnitures Prayagraj."
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
        eyebrow="Riddhy living spaces · Prayagraj"
        title="Furniture with room to live."
        description="Warm solid woods, thoughtful Indian proportions and handcrafted pieces built for everyday family life in Prayagraj & Uttar Pradesh."
        count={total}
      />
      <CatalogShell
        products={items}
        title="Furniture collection"
        description="Explore a thoughtfully curated range with doorstep delivery in Prayagraj."
      />
    </>
  );
}
