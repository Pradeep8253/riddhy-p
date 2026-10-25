import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts } from "@/lib/catalogue";

export const metadata = {
  title: "Utensils & Kitchenware | RF Riddhy",
  description:
    "Explore heavy gauge stainless steel dinner sets, pressure cookers, tri-ply kadais, casseroles, and complete wedding kitchenware sets at RF Riddhy Mansurabad.",
};

export default async function UtensilsPage() {
  const { items, total } = await getProducts({ type: "utensils", limit: 48 });
  return (
    <>
      <ListingHeader
        eyebrow="Authentic Kitchenware Collection"
        title="Utensils crafted for Indian kitchens."
        description="Heavy-gauge food-grade stainless steel, tri-ply cookware, dinner sets and daily essentials with verified quality and replacement assurance."
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
