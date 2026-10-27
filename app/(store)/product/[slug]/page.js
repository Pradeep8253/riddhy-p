import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/commerce/ProductDetailClient";
import { getCatalogProduct, getProducts } from "@/lib/catalogue";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.tagline,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [product.image || "/images/product-sofa.webp"],
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

  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    image: product.image
      ? [
          (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
            product.image,
        ]
      : [],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "RF Riddhy",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/product/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
