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
  const categories = await getCategories("appliances");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  const name = found?.name || category.replace(/-/g, " ");
  const title = `${name} in Prayagraj | Home Appliances | Riddhy Furnitures`;
  const description = `Buy certified ${name.toLowerCase()} at best price in Prayagraj & Mansoorabad from Riddhy Furnitures. Brand warranty, star energy ratings & free doorstep delivery.`;
  const canonical = getCanonicalUrl(`/appliances/${category}`);

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} in Prayagraj`,
      `${name.toLowerCase()} shop Prayagraj`,
      `${name.toLowerCase()} price Prayagraj`,
      "home appliances shop in Prayagraj",
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

export default async function ApplianceCategoryPage({ params }) {
  const { category } = await params;
  const categories = await getCategories("appliances");
  const found =
    categories.find((item) => item.slug === category) ||
    categories.find(
      (item) =>
        item.slug === `${category}s` ||
        item.slug.replace(/s$/, "") === category.replace(/s$/, "")
    );

  if (!found) notFound();

  const { items, total } = await getProducts({
    type: "appliance",
    category,
    limit: 48,
  });

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Appliances", url: "/appliances" },
    { name: found.name, url: `/appliances/${category}` },
  ]);

  const itemList = getItemListSchema(
    items,
    `${found.name} in Prayagraj`,
    `Certified ${found.name.toLowerCase()} collection with warranty at Riddhy Furnitures Prayagraj.`
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
        eyebrow="Appliances · Prayagraj Precision Studio"
        title={found.name}
        description={`Compare ${found.name.toLowerCase()} with capacity, energy star ratings, dimensions, brand warranty and fast delivery in Prayagraj & Mansoorabad.`}
        count={total}
      />
      <CatalogShell
        products={items}
        title={found.name}
        description="Choose with brand warranty and authentic specifications clearly shown."
      />
    </>
  );
}
