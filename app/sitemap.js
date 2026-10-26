import { connectDB } from "@/lib/db";
import { Product } from "@/models/index";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/furniture", priority: 0.9, freq: "daily" },
    { path: "/appliances", priority: 0.9, freq: "daily" },
    { path: "/products", priority: 0.9, freq: "daily" },
    { path: "/packages", priority: 0.9, freq: "daily" },
    { path: "/marriage-packages", priority: 0.8, freq: "weekly" },
    { path: "/offers", priority: 0.8, freq: "daily" },
    { path: "/rooms", priority: 0.8, freq: "weekly" },
    { path: "/rooms/living-room", priority: 0.7, freq: "weekly" },
    { path: "/rooms/bedroom", priority: 0.7, freq: "weekly" },
    { path: "/rooms/kitchen", priority: 0.7, freq: "weekly" },
    { path: "/rooms/dining", priority: 0.7, freq: "weekly" },
    { path: "/rooms/study", priority: 0.7, freq: "weekly" },
    { path: "/track-order", priority: 0.7, freq: "daily" },
    { path: "/warranty", priority: 0.7, freq: "weekly" },
    { path: "/about", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/faq", priority: 0.6, freq: "weekly" },
    { path: "/bulk-enquiry", priority: 0.6, freq: "monthly" },
    { path: "/collections/best-selling", priority: 0.7, freq: "weekly" },
    { path: "/collections/popular", priority: 0.7, freq: "weekly" },
    { path: "/collections/trending", priority: 0.7, freq: "weekly" },
    { path: "/collections/new-arrival", priority: 0.7, freq: "weekly" },
    { path: "/collections/featured", priority: 0.7, freq: "weekly" },
    { path: "/collections/deal", priority: 0.7, freq: "weekly" },
    { path: "/policies/shipping", priority: 0.5, freq: "monthly" },
    { path: "/policies/returns", priority: 0.5, freq: "monthly" },
    { path: "/policies/refund", priority: 0.5, freq: "monthly" },
    { path: "/policies/warranty", priority: 0.5, freq: "monthly" },
    { path: "/policies/privacy", priority: 0.5, freq: "monthly" },
    { path: "/policies/terms", priority: 0.5, freq: "monthly" },
  ];

  let productEntries = [];
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const docs = await Product.find({ status: "active" })
        .select("slug updatedAt")
        .lean();
      if (docs.length) {
        productEntries = docs.map((p) => ({
          url: `${base}/product/${p.slug}`,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.warn("Sitemap DB product fetch error:", error.message);
  }

  const staticEntries = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  return [...staticEntries, ...productEntries];
}
