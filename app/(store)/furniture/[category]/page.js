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
  const categories = await getCategories("furniture");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  const name = found?.name || category.replace(/-/g, " ");
  const title = `${name} in Prayagraj | Riddhy Furnitures`;
  const description = `Shop ${name.toLowerCase()} in Prayagraj & Mansoorabad (229411) at Riddhy Furnitures. Handcrafted solid wood, modern finishes, 10-year warranty & free doorstep delivery.`;
  const canonical = getCanonicalUrl(`/furniture/${category}`);

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} in Prayagraj`,
      `${name.toLowerCase()} shop Prayagraj`,
      `${name.toLowerCase()} showroom Mansoorabad`,
      "furniture shop in Prayagraj",
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

export default async function FurnitureCategoryPage({ params }) {
  const { category } = await params;
  const categories = await getCategories("furniture");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  if (!found) notFound();

  const { items, total } = await getProducts({
    type: "furniture",
    category,
    limit: 48,
  });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Furniture", url: "/furniture" },
    { name: found.name, url: `/furniture/${category}` },
  ]);

  const itemList = getItemListSchema(
    items,
    `${found.name} in Prayagraj`,
    `Handcrafted ${found.name.toLowerCase()} collection at Riddhy Furnitures Prayagraj.`
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
        eyebrow="Furniture · Prayagraj Showroom"
        title={found.name}
        description={`A carefully selected range of ${found.name.toLowerCase()} with dimensions, solid wood details, free doorstep delivery and warranty in Prayagraj & Mansoorabad.`}
        count={total}
      />
      <CatalogShell
        products={items}
        title={found.name}
        description="Use the filters to find the right dimensions, material, and finish for your space."
      />
    </>
  );
}
