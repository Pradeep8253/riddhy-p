import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts } from "@/lib/catalogue";
import { getCanonicalUrl, getBreadcrumbSchema, getItemListSchema } from "@/lib/seo";

export const metadata = {
  title: "Kitchen Utensils & Cookware Shop in Prayagraj | Stainless Steel Dinner Sets",
  description:
    "Explore heavy gauge stainless steel dinner sets, tri-ply cookware, pressure cookers, casseroles, water dispensers, and complete wedding kitchenware sets in Prayagraj & Mansoorabad from RF Riddhy.",
  keywords: [
    "kitchen utensils shop in Prayagraj",
    "utensils shop in Prayagraj",
    "stainless steel dinner set Prayagraj",
    "cookware shop in Prayagraj",
    "pressure cooker shop in Prayagraj",
    "marriage utensil set Prayagraj",
  ],
  alternates: {
    canonical: getCanonicalUrl("/utensils"),
  },
  openGraph: {
    title: "Kitchen Utensils & Cookware in Prayagraj | RF Riddhy",
    description:
      "Heavy gauge stainless steel cookware, dinner sets, and kitchen essentials in Prayagraj.",
    url: getCanonicalUrl("/utensils"),
    images: ["/images/og-image.webp"],
  },
};

export default async function UtensilsPage() {
  const { items, total } = await getProducts({ type: "utensils", limit: 48 });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Utensils", url: "/utensils" },
  ]);

  const itemList = getItemListSchema(
    items,
    "Kitchen Utensils Collection in Prayagraj",
    "Food-grade stainless steel cookware and dinner sets in Prayagraj."
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
        eyebrow="Authentic Kitchenware Collection · Prayagraj"
        title="Utensils crafted for Indian kitchens."
        description="Heavy-gauge food-grade stainless steel, tri-ply cookware, dinner sets and daily essentials with verified quality and replacement assurance in Prayagraj & Mansoorabad."
        count={total}
      />
      <CatalogShell
        products={items}
        title="Utensils & Cookware Collection"
        description="Explore curated dinnerware, cooktops, kadais, and marriage utensil packages."
      />
    </>
  );
}
