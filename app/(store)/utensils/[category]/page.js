import { notFound } from "next/navigation";
import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts, getCategories } from "@/lib/catalogue";
import {
  getCanonicalUrl,
  getBreadcrumbSchema,
  getItemListSchema,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categories = await getCategories("utensils");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  const name = found?.name || category.replace(/-/g, " ");
  const title = `${name} in Prayagraj | Kitchenware & Utensils | RF Riddhy`;
  const description = `Shop authentic food-grade ${name.toLowerCase()} in Prayagraj & Mansoorabad from RF Riddhy. Heavy gauge stainless steel, marriage packages & doorstep delivery.`;
  const canonical = getCanonicalUrl(`/utensils/${category}`);

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} in Prayagraj`,
      `${name.toLowerCase()} shop Prayagraj`,
      "kitchen utensils in Prayagraj",
      "stainless steel utensils Prayagraj",
      "Riddhy Furnitures",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | RF Riddhy`,
      description,
      url: canonical,
      images: [found?.image || "/images/og-image.webp"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [found?.image || "/images/og-image.webp"],
    },
  };
}

export default async function UtensilCategoryPage({ params }) {
  const { category } = await params;
  const categories = await getCategories("utensils");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  if (!found) notFound();

  const { items, total } = await getProducts({
    type: "utensils",
    category,
    limit: 48,
  });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Utensils", url: "/utensils" },
    { name: found.name, url: `/utensils/${category}` },
  ]);

  const itemList = getItemListSchema(
    items,
    `${found.name} in Prayagraj`,
    `Food-grade ${found.name.toLowerCase()} collection at RF Riddhy Prayagraj.`
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
        eyebrow="Utensils · Prayagraj Kitchen Essentials"
        title={found.name}
        description={`Explore heavy-gauge food-grade ${found.name.toLowerCase()} with replacement assurance and doorstep delivery in Prayagraj & Mansoorabad.`}
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
