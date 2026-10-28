import { unstable_cache } from "next/cache";
import {
  Banner,
  Category,
  Inventory,
  Product,
  Variant,
} from "../models/index.js";
import { connectDB } from "./db.js";

const cachedDbProducts = unstable_cache(
  async () => {
    if (!process.env.MONGODB_URI) return [];
    try {
      await connectDB();
      const products = await Product.find({ status: "active", isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
      if (!products.length) return [];
      const productIds = products.map((product) => product._id),
        variants = await Variant.find({
          productId: { $in: productIds },
          active: true,
        })
          .sort({ createdAt: 1 })
          .lean();
      const variantIds = variants.map((variant) => variant._id),
        stockRows = variantIds.length
          ? await Inventory.aggregate([
              { $match: { variantId: { $in: variantIds } } },
              {
                $group: {
                  _id: "$variantId",
                  available: { $sum: "$available" },
                  reserved: { $sum: "$reserved" },
                },
              },
            ])
          : [];
      const variantByProduct = new Map();
      for (const variant of variants)
        if (!variantByProduct.has(String(variant.productId)))
          variantByProduct.set(String(variant.productId), variant);
      const stockByVariant = new Map(
        stockRows.map((row) => [String(row._id), row]),
      );
      return products
        .map((product) => {
          const variant = variantByProduct.get(String(product._id));
          if (!variant) {
            const price = Number(product.price || 0);
            const mrp = Number(product.mrp || price);
            const discount =
              mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
            return {
              ...product,
              sku:
                product.sku ||
                `RF-${String(product._id).slice(-6).toUpperCase()}`,
              price,
              mrp,
              discount,
              stock: Number(product.stock || 0),
              reserved: 0,
              id: String(product._id),
            };
          }
          const stock = stockByVariant.get(String(variant._id)),
            attributes =
              variant.attributes instanceof Map
                ? Object.fromEntries(variant.attributes)
                : variant.attributes || {};
          const price = Number(variant.price ?? product.price ?? 0),
            mrp = Number(variant.mrp ?? product.mrp ?? price),
            discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
          return {
            ...product,
            sku: variant.sku,
            variantId: String(variant._id),
            variant: attributes,
            price,
            mrp,
            discount,
            stock: Number(stock?.available ?? variant.stock ?? 0),
            reserved: Number(stock?.reserved ?? 0),
            id: String(product._id),
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.warn(
        "Catalogue database unavailable; serving demo catalogue:",
        error.message,
      );
      return [];
    }
  },
  ["rf-riddhy-active-products-v12"],
  { revalidate: 5, tags: ["catalogue"] },
);

function plainProduct(product) {
  return {
    ...product,
    id: String(product._id || product.id),
    _id: undefined,
    brandId: product.brandId ? String(product.brandId) : undefined,
    categoryId: product.categoryId ? String(product.categoryId) : undefined,
    variantId: product.variantId ? String(product.variantId) : undefined,
  };
}
export async function getCatalogue() {
  const stored = await cachedDbProducts();
  return stored.length ? stored.map(plainProduct) : [];
}
export async function getCatalogProduct(slug) {
  const all = await getCatalogue();
  return all.find((product) => product.slug === slug) || null;
}
export async function getProductGallery(slug) {
  const product = await getCatalogProduct(slug);
  return product?.gallery || [];
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        next[j - 1] + 1,
        row[j] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[b.length];
}
export function searchProducts(products, query) {
  const q = normalize(query);
  if (!q) return products;
  const tokens = q.split(" ").filter(Boolean);
  return products
    .map((product) => {
      const hay = normalize(
        [
          product.name,
          product.brand,
          product.categoryLabel,
          product.category,
          product.sku,
          product.tagline,
        ].join(" "),
      );
      let score = 0;
      for (const token of tokens) {
        if (hay.includes(token)) score += 5;
        else if (hay.split(" ").some((word) => distance(token, word) <= 1))
          score += 2;
      }
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}
export async function getProducts({
  type,
  category,
  tag,
  q,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 24,
} = {}) {
  let products = await getCatalogue();
  if (type)
    products = products.filter(
      (item) =>
        item.type === type ||
        item.type ===
          (type === "appliances"
            ? "appliance"
            : type === "furniture"
              ? "furniture"
              : type),
    );
  if (category) {
    const norm = String(category).toLowerCase().trim();
    products = products.filter((item) => {
      const itemCat = String(item.category || "").toLowerCase().trim();
      if (itemCat === norm) return true;
      if (itemCat === `${norm}s` || `${itemCat}s` === norm) return true;
      if (itemCat.replace(/s$/, "") === norm.replace(/s$/, "")) return true;
      if (itemCat.replace(/-/g, "") === norm.replace(/-/g, "")) return true;
      return false;
    });
  }
  if (tag)
    products = products.filter(
      (item) => Array.isArray(item.tags) && item.tags.includes(tag),
    );
  if (q) products = searchProducts(products, q);
  if (Number.isFinite(Number(minPrice)))
    products = products.filter((item) => item.price >= Number(minPrice));
  if (Number.isFinite(Number(maxPrice)))
    products = products.filter((item) => item.price <= Number(maxPrice));
  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (sort === "rating")
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === "newest" || sort === "featured" || !sort)
    products.sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    );
  if (sort === "bestselling" || sort === "sales30d")
    products.sort((a, b) => (b.sales30d || 0) - (a.sales30d || 0));
  if (sort === "popular")
    products.sort(
      (a, b) =>
        (b.views30d || 0) +
        (b.wishlistCount || 0) * 5 -
        ((a.views30d || 0) + (a.wishlistCount || 0) * 5),
    );
  const total = products.length,
    start = (Math.max(1, page) - 1) * Math.max(1, limit);
  return {
    items: products.slice(start, start + limit),
    total,
    page: Math.max(1, page),
    limit,
    pages: Math.ceil(total / limit),
  };
}
export async function getProductsByTag(tag, limit = 12) {
  const result = await getProducts({
    tag,
    limit,
    sort:
      tag === "best-selling"
        ? "bestselling"
        : tag === "new-arrival"
          ? "newest"
          : "featured",
  });
  return result.items;
}
export async function getCategories(type) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const query = {
        active: true,
        isDeleted: { $ne: true },
        ...(type ? { type: type === "appliances" ? "appliance" : type } : {}),
      };
      const rows = await Category.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
      if (rows.length)
        return rows.map((row) => ({
          ...row,
          id: String(row._id),
          _id: undefined,
        }));
    } catch (error) {
      console.warn("Category read fallback:", error.message);
    }
  }
  return [];
}
export async function getCampaigns(zone) {
  if (!process.env.MONGODB_URI) return [];
  try {
    await connectDB();
    const now = new Date();
    return await Banner.find({
      active: true,
      startsAt: { $lte: now },
      endsAt: { $gt: now },
      ...(zone ? { zone } : {}),
    })
      .sort({ startsAt: -1 })
      .lean();
  } catch (error) {
    console.warn("Campaign read failed:", error.message);
    return [];
  }
}

export async function getHeroBanners() {
  if (!process.env.MONGODB_URI) return { slides: [], sideCards: [] };
  try {
    await connectDB();
    const now = new Date();
    const dateFilter = {
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] }
      ]
    };
    const banners = await Banner.find({
      active: true,
      ...dateFilter,
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const sliderCandidates = banners.filter(
      (b) => (b.zone === 'hero-slider' || b.zone === 'home-hero') && (b.desktopImage || b.mobileImage)
    );
    const slides = sliderCandidates.map((b) => ({
      id: String(b._id),
      src: b.desktopImage || b.mobileImage,
      alt: b.title || b.name || 'Hero Banner',
      href: b.href || '/packages',
    }));

    const topBanner = banners.find(
      (b) => b.zone === 'hero-side-top' && (b.desktopImage || b.mobileImage)
    );
    const bottomBanner = banners.find(
      (b) => b.zone === 'hero-side-bottom' && (b.desktopImage || b.mobileImage)
    );

    const sideCards = [
      topBanner
        ? {
            id: String(topBanner._id),
            src: topBanner.desktopImage || topBanner.mobileImage,
            alt: topBanner.title || topBanner.name || 'Hero Right Top Banner',
            href: topBanner.href || '/offers',
          }
        : null,
      bottomBanner
        ? {
            id: String(bottomBanner._id),
            src: bottomBanner.desktopImage || bottomBanner.mobileImage,
            alt: bottomBanner.title || bottomBanner.name || 'Hero Right Bottom Banner',
            href: bottomBanner.href || '/packages',
          }
        : null,
    ].filter(Boolean);

    return { slides, sideCards };
  } catch (error) {
    console.warn("Hero banners read failed:", error.message);
    return { slides: [], sideCards: [] };
  }
}

export async function getCuratedLook(room = "living") {
  const allProducts = await getCatalogue();
  if (room === "living" || !room) {
    const sofa =
      allProducts.find((p) => p.slug === "mira-3-seater-sofa") ||
      allProducts.find(
        (p) =>
          p.type === "furniture" &&
          (p.category === "sofa-set" || p.category === "sofas"),
      ) ||
      allProducts.find((p) => p.type === "furniture") ||
      null;

    const decor =
      allProducts.find((p) => p.slug === "aangan-accent-lamp") ||
      allProducts.find(
        (p) => p.category === "decor" || p.modelType === "decor",
      ) ||
      null;

    const storage =
      allProducts.find((p) => p.slug === "sajilo-shoe-cabinet") ||
      allProducts.find(
        (p) =>
          p.category === "storage" ||
          p.category === "centre-table" ||
          p.modelType === "storage",
      ) ||
      null;

    const hotspots = [];
    if (sofa) {
      hotspots.push({
        id: "sofa-hotspot",
        top: "60%",
        left: "50%",
        product: {
          id: String(sofa.id || sofa._id),
          slug: sofa.slug,
          sku:
            sofa.sku ||
            `RF-${String(sofa.id || sofa._id || "").slice(-6).toUpperCase()}`,
          name: sofa.name,
          tagline: sofa.tagline || "",
          categoryLabel: sofa.categoryLabel || "Sofas & Sectionals",
          price: Number(sofa.price || 0),
          mrp: Number(sofa.mrp || sofa.price || 0),
          image: sofa.image || "/images/products/mira-3-seater-sofa/front.webp",
        },
      });
    }
    if (decor) {
      hotspots.push({
        id: "decor-hotspot",
        top: "32%",
        left: "68%",
        product: {
          id: String(decor.id || decor._id),
          slug: decor.slug,
          sku:
            decor.sku ||
            `RF-${String(decor.id || decor._id || "").slice(-6).toUpperCase()}`,
          name: decor.name,
          tagline: decor.tagline || "",
          categoryLabel: decor.categoryLabel || "Home Décor",
          price: Number(decor.price || 0),
          mrp: Number(decor.mrp || decor.price || 0),
          image: decor.image || "/images/products/aangan-accent-lamp/front.webp",
        },
      });
    }
    if (storage) {
      hotspots.push({
        id: "table-hotspot",
        top: "66%",
        left: "14%",
        product: {
          id: String(storage.id || storage._id),
          slug: storage.slug,
          sku:
            storage.sku ||
            `RF-${String(storage.id || storage._id || "").slice(-6).toUpperCase()}`,
          name: storage.name,
          tagline: storage.tagline || "",
          categoryLabel: storage.categoryLabel || "Storage & Shelving",
          price: Number(storage.price || 0),
          mrp: Number(storage.mrp || storage.price || 0),
          image:
            storage.image || "/images/products/sajilo-shoe-cabinet/front.webp",
        },
      });
    }

    return {
      roomName: "Curated Living Room",
      tagline: "Balanced warmth, natural woods, and everyday comfort",
      image: "/images/room-living.webp?v=20261023",
      hotspots,
    };
  }

  const roomProducts = allProducts.filter((p) => p.room === room);
  return {
    roomName: `${room.charAt(0).toUpperCase() + room.slice(1)} Inspiration`,
    tagline: "Thoughtfully selected pieces for everyday living",
    image: `/images/room-${room}.webp`,
    hotspots: roomProducts.slice(0, 3).map((p, idx) => ({
      id: `spot-${idx}`,
      top: `${40 + idx * 15}%`,
      left: `${20 + idx * 25}%`,
      product: {
        id: String(p.id || p._id),
        slug: p.slug,
        sku:
          p.sku ||
          `RF-${String(p.id || p._id || "").slice(-6).toUpperCase()}`,
        name: p.name,
        tagline: p.tagline || "",
        categoryLabel: p.categoryLabel || p.category || "",
        price: Number(p.price || 0),
        mrp: Number(p.mrp || p.price || 0),
        image: p.image || "/images/product-sofa.webp",
      },
    })),
  };
}

export {
  getLivePackages,
  getLivePackageBySlug,
  serializePackage,
} from "./packages-data.js";
