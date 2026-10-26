import { Coupon, Inventory, Product, Variant } from "../models/index.js";
import { connectDB } from "./db.js";
import { releaseExpiredReservations } from "./inventory.js";
import { quoteCart } from "./pricing.js";
import { checkServiceability, estimateFees } from "./serviceability.js";

export async function resolveCheckoutItems(requestItems) {
  if (!process.env.MONGODB_URI) {
    throw new Error("Database connection is required to process checkout items.");
  }
  await connectDB();
  await releaseExpiredReservations();
  const resolved = [];
  for (const { sku, qty } of requestItems) {
    let variant = await Variant.findOne({ sku, active: true }).lean();
    let product;
    if (variant) {
      product = await Product.findById(variant.productId).lean();
    } else {
      product = await Product.findOne({ $or: [{ sku }, { slug: sku }] }).lean();
      if (product) {
        variant = await Variant.findOne({
          productId: product._id,
          active: true,
        }).lean();
      }
    }
    if (!product || product.status !== "active")
      throw new Error(`Product for SKU ${sku} is not available.`);
    let available = product.stock || 0;
    if (variant) {
      const stock = await Inventory.aggregate([
        { $match: { variantId: variant._id } },
        { $group: { _id: null, available: { $sum: "$available" } } },
      ]);
      if (stock[0]?.available !== undefined) available = stock[0].available;
    }
    if (available < qty && available > 0)
      throw new Error(`${product.name} has insufficient available stock.`);
    resolved.push({
      ...product,
      id: String(product._id),
      sku: variant?.sku || product.sku || sku,
      price: variant?.price ?? product.price,
      mrp: variant?.mrp ?? product.mrp ?? product.price,
      stock: available,
      qty,
      variant: { ...(variant?.attributes || {}) },
      variantId: variant ? String(variant._id) : undefined,
      productId: String(product._id),
    });
  }
  return resolved;
}

export async function getCoupon(code) {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase();
  if (!process.env.MONGODB_URI) {
    const endsAt = new Date("2026-11-30T18:29:59+05:30");
    const coupons = {
      RIDDHY500: {
        kind: "fixed",
        value: 500,
        minCartValue: 10000,
        maxDiscount: 500,
        endsAt,
      },
      WELCOME10: {
        kind: "percentage",
        value: 10,
        minCartValue: 5000,
        maxDiscount: 1500,
        endsAt,
      },
      DIWALI10: {
        kind: "percentage",
        value: 10,
        minCartValue: 5000,
        maxDiscount: 2000,
        endsAt,
      },
      DIWALIDHAMAKA: {
        kind: "percentage",
        value: 15,
        minCartValue: 5000,
        maxDiscount: 3000,
        endsAt,
      },
    };
    const coupon = coupons[normalized];
    return coupon
      ? {
          ...coupon,
          code: normalized,
          active: true,
          startsAt: new Date("2026-10-01T00:00:00+05:30"),
        }
      : null;
  }
  await connectDB();
  return Coupon.findOne({ code: normalized, active: true }).lean();
}

export async function buildServerQuote({ items, pincode, coupon }) {
  const lines = await resolveCheckoutItems(items);
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.qty, 0);
  let couponDiscount = 0,
    couponMessage = "";
  if (coupon) {
    const found = await getCoupon(coupon),
      now = new Date();
    if (
      !found ||
      !found.active ||
      (found.startsAt && new Date(found.startsAt) > now) ||
      (found.endsAt && new Date(found.endsAt) <= now)
    )
      throw new Error("This coupon is invalid or has expired.");
    if (subtotal < Number(found.minCartValue || 0))
      throw new Error(
        `This coupon requires a cart value of at least ₹${Number(found.minCartValue).toLocaleString("en-IN")}.`,
      );
    couponDiscount =
      found.kind === "percentage"
        ? Math.round((subtotal * Number(found.value)) / 100)
        : Number(found.value);
    if (found.maxDiscount)
      couponDiscount = Math.min(couponDiscount, Number(found.maxDiscount));
    couponMessage = `${found.code} applied`;
  }
  const fees = estimateFees(lines, pincode);
  const quoted = quoteCart(
    lines.map((line) => ({
      sku: line.sku,
      name: line.name,
      price: line.price,
      qty: line.qty,
      discount: 0,
    })),
    { ...fees, couponDiscount },
  );
  const serviceability = pincode ? checkServiceability(pincode) : null;
  return {
    ...quoted,
    couponCode: coupon ? String(coupon).toUpperCase() : null,
    couponMessage,
    serviceability,
    codAllowed: Boolean(serviceability?.serviceable && quoted.total <= 25000),
    items: quoted.lines.map((line, index) => ({
      ...line,
      product: lines[index],
    })),
    demoOnly: !process.env.MONGODB_URI,
  };
}
