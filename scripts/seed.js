import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/db.js';
import { getDemoProducts, CATEGORY_SEED, BRAND_SEED } from '../lib/demo-data.js';
import { IMG } from '../lib/images.js';
import { Category, Brand, Product, Variant, Warehouse, Inventory, Coupon, Promotion, Banner, AdminUser, Role, WarrantyPolicy } from '../models/index.js';

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB. Seeding RF Riddhy demo catalogue…');

  const categories = new Map();
  for (const entry of CATEGORY_SEED) {
    const category = await Category.findOneAndUpdate({ slug: entry.slug }, { $set: { ...entry, active: true, sortOrder: categories.size } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    categories.set(entry.slug, category);
  }
  const brands = new Map();
  for (const name of BRAND_SEED) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const brand = await Brand.findOneAndUpdate({ slug }, { $set: { name, slug, active: true, description: 'A demo brand in the RF Riddhy sample catalogue.' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    brands.set(name, brand);
  }

  const warehouse = await Warehouse.findOneAndUpdate({ code: 'DELHI-01' }, { $set: { code: 'DELHI-01', name: 'Delhi fulfilment hub', active: true, address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' } } }, { upsert: true, new: true });
  let productCount = 0;
  for (const item of getDemoProducts()) {
    const category = categories.get(item.category);
    const brand = brands.get(item.brand);
    await Product.updateOne({ slug: item.slug }, { $set: {
      name: item.name, slug: item.slug, brandId: brand._id, brand: item.brand, categoryId: category._id, category: item.category,
      categoryLabel: item.categoryLabel, room: item.room, type: item.type, modelType: item.modelType, tagline: item.tagline,
      image: item.image, imageAlt: item.imageAlt, media: [{ url: item.image, kind: 'image', alt: item.imageAlt, isDemoImage: true }],
      specs: item.specs, dimensions: item.dimensions, packageDimensions: item.packageDimensions, warranty: item.warranty,
      gstRate: item.gstRate, price: item.price, mrp: item.mrp, discount: item.discount, status: 'active', isDemo: true,
      isDemoImage: true, features: item.features, seo: { title: item.metaTitle, description: item.metaDescription },
      model3d: { type: item.modelType, dims: item.dimensions }
    } }, { upsert: true, setDefaultsOnInsert: true });
    const product = await Product.findOne({ slug: item.slug }).select('_id').lean();
    const variant = await Variant.findOneAndUpdate({ sku: item.sku }, { $set: { productId: product._id, sku: item.sku, attributes: { finish: item.specs.colour || item.specs.finish || 'Satin ivory' }, price: item.price, mrp: item.mrp, stock: item.stock, active: true, model3d: { type: item.modelType, dims: item.dimensions } } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await Inventory.findOneAndUpdate({ variantId: variant._id, warehouseId: warehouse._id }, { $set: { available: item.stock, reserved: 0, lowStockAt: 4 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    productCount += 1;
  }

  const now = new Date();
  const monthAhead = new Date(now.getTime() + 45 * 86400000);
  await Coupon.findOneAndUpdate({ code: 'RIDDHY500' }, { $set: { code: 'RIDDHY500', kind: 'fixed', value: 500, minCartValue: 10000, maxDiscount: 500, startsAt: new Date(now.getTime() - 86400000), endsAt: monthAhead, usageLimit: 500, active: true } }, { upsert: true });
  await Coupon.findOneAndUpdate({ code: 'WELCOME10' }, { $set: { code: 'WELCOME10', kind: 'percentage', value: 10, minCartValue: 5000, maxDiscount: 1500, startsAt: new Date(now.getTime() - 86400000), endsAt: monthAhead, usageLimit: 1000, active: true } }, { upsert: true });
  await Promotion.findOneAndUpdate({ code: 'FESTIVE-2026' }, { $set: { name: 'Golden Hour edit', code: 'FESTIVE-2026', kind: 'percentage', value: 12, startsAt: now, endsAt: monthAhead, active: true, rules: { eligibleTypes: ['furniture','appliance'] } } }, { upsert: true });
  await Banner.findOneAndUpdate({ name: 'Golden Hour edit 2026' }, { $set: { name: 'Golden Hour edit 2026', zone: 'home-hero', desktopImage: IMG.banners.festive, mobileImage: IMG.banners.festiveMobile, href: '/offers', alt: 'Golden Hour edit — warm home offer', startsAt: now, endsAt: monthAhead, active: true, targeting: { types: ['all'] } } }, { upsert: true });
  await Banner.findOneAndUpdate({ name: 'Installation promise' }, { $set: { name: 'Installation promise', zone: 'home-support', desktopImage: IMG.banners.installation, href: '/offers', alt: 'Delivery and installation made clear', startsAt: new Date(now.getTime() - 86400000), endsAt: new Date(now.getTime() + 365 * 86400000), active: true } }, { upsert: true });

  const policyEntries = [
    { name: 'Furniture frame cover', source: 'seller', durationDays: 730, startsOn: 'delivery', coverage: 'Eligible frame and hardware defects', policyVersion: '2026.1' },
    { name: 'Appliance manufacturer cover', source: 'manufacturer', durationDays: 365, startsOn: 'installation', coverage: 'Manufacturer coverage varies by model', policyVersion: '2026.1' },
    { name: 'Extended protection', source: 'extended', durationDays: 1095, extensionPriceInr: 1299, startsOn: 'delivery', coverage: 'Optional extended protection as stated at purchase', policyVersion: '2026.1' }
  ];
  for (const policy of policyEntries) await WarrantyPolicy.findOneAndUpdate({ name: policy.name }, { $set: { ...policy, active: true } }, { upsert: true });

  const roles = [
    { name: 'super-admin', permissions: ['*'], system: true },
    { name: 'admin', permissions: ['catalogue:read','catalogue:write','orders:read','orders:write','cms:read','cms:write','reports:read'], system: true },
    { name: 'support', permissions: ['orders:read','warranty:read','warranty:write'], system: true },
    { name: 'warehouse', permissions: ['inventory:read','inventory:write','orders:read'], system: true }
  ];
  for (const role of roles) await Role.findOneAndUpdate({ name: role.name }, { $set: role }, { upsert: true });

  const adminEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@riddhy.in').toLowerCase();
  const password = process.env.DEMO_ADMIN_PASSWORD || 'RiddhyDemo!2026';
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.findOneAndUpdate({ email: adminEmail }, { $set: { name: 'RF Riddhy Store Admin', email: adminEmail, passwordHash, role: 'super-admin', active: true } }, { upsert: true });

  console.log(`Seed complete: ${CATEGORY_SEED.length} categories, ${BRAND_SEED.length} brands, ${productCount} products, 2 coupons.`);
  console.log(`Demo admin: ${adminEmail} / ${password}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error('Seed failed:', error.message); await mongoose.disconnect().catch(() => {}); process.exitCode = 1; });
