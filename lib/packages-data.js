import { connectDB } from "./db.js";
import { MarriagePackage } from "../models/index.js";

export function serializePackage(doc) {
  if (!doc) return null;
  const plain = JSON.parse(JSON.stringify(doc));
  return {
    ...plain,
    id: String(plain._id || plain.id || ""),
    hindiName: plain.hindiName || plain.name_hi || "",
  };
}

export async function getLivePackages() {
  if (!process.env.MONGODB_URI) return [];
  try {
    await connectDB();
    const docs = await MarriagePackage.find({ active: true })
      .sort({ sortOrder: 1, price: 1 })
      .lean();
    return (docs || []).map(serializePackage);
  } catch (err) {
    console.error("Database error in getLivePackages:", err);
    return [];
  }
}

export async function getLivePackageBySlug(slug) {
  if (!process.env.MONGODB_URI) return null;
  try {
    await connectDB();
    const doc = await MarriagePackage.findOne({ slug, active: true }).lean();
    if (doc) return serializePackage(doc);
  } catch (err) {
    console.error("Database error in getLivePackageBySlug:", err);
  }
  return null;
}
