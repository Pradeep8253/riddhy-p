import { notFound } from "next/navigation";
import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts, getCategories } from "@/lib/catalogue";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const found = (await getCategories("utensils")).find(
    (item) => item.slug === category,
  );
  return {
    title: found ? `${found.name} | Utensils & Kitchenware` : "Utensils",
    description: found
      ? `Browse authentic ${found.name.toLowerCase()} with material specifications, dimensions, and replacement assurance at RF Riddhy.`
      : "Utensils and kitchenware at RF Riddhy",
  };
}

export default async function UtensilCategoryPage({ params }) {
  const { category } = await params;
  const found = (await getCategories("utensils")).find(
    (item) => item.slug === category,
  );
  if (!found) notFound();

  const { items, total } = await getProducts({
    type: "utensils",
    category,
    limit: 48,
  });

  return (
    <>
      <ListingHeader
        eyebrow="Utensils · Kitchen Essentials"
        title={found.name}
        description={`Explore premium ${found.name.toLowerCase()} crafted from certified food-grade stainless steel with doorstep delivery and warranty support.`}
        count={total}
      />
      <CatalogShell
        products={items}
        title={found.name}
        description="Filter and find the exact specifications for your kitchen."
      />
    </>
  );
}
