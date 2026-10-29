import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/commerce/ProductDetailClient";
import { getCatalogProduct, getProducts } from "@/lib/catalogue";
import {
  getCanonicalUrl,
  getProductSchema,
  getBreadcrumbSchema,
  SITE_URL,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return { title: "Product not found" };

  const dept =
    product.type === "appliance"
      ? "appliances"
      : product.type === "utensils"
        ? "utensils"
        : "furniture";

  const title = product.metaTitle || `${product.name} in Prayagraj | RF Riddhy`;
  const description =
    product.metaDescription ||
    product.tagline ||
    `Buy ${product.name} at ₹${product.price} in Prayagraj & Mansoorabad from Riddhy Furnitures. 100% genuine quality, doorstep delivery, assembly & warranty support.`;

  const canonical = getCanonicalUrl(`/product/${product.slug}`);
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image || "/images/og-image.webp"}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} in Prayagraj`,
      `${product.category} in Prayagraj`,
      "furniture shop in Prayagraj",
      "Riddhy Furnitures",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      siteName: "Riddhy Furnitures",
      title,
      description,
      url: canonical,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();

  // Fetch real related products from database
  const { items: catProducts } = await getProducts({
    category: product.category,
    limit: 6,
  });
  const related = catProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  const dept =
    product.type === "appliance"
      ? "appliances"
      : product.type === "utensils"
        ? "utensils"
        : "furniture";

  const deptLabel =
    product.type === "appliance"
      ? "Appliances"
      : product.type === "utensils"
        ? "Utensils"
        : "Furniture";

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: deptLabel, url: `/${dept}` },
    ...(product.category
      ? [{ name: product.categoryLabel || product.category, url: `/${dept}/${product.category}` }]
      : []),
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  const productSchema = getProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbs]).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
