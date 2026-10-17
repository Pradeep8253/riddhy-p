import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Product,
  Variant,
  Category,
  Warehouse,
  Inventory,
  StockMovement,
  Order,
  Payment,
  Invoice,
  ProductRegistration,
  WarrantyClaim,
  SiteSetting
} from '../models/index.js';
import { CATEGORY_SEED } from '../lib/demo-data.js';
import { IMG } from '../lib/images.js';

const ADJECTIVES = ['Royal', 'Classic', 'Modern', 'Compact', 'Nordic', 'Heritage', 'Zenith', 'Elite', 'Serene', 'Aura', 'Urban', 'Velvet', 'Artisan', 'Prime'];
const MATERIALS = ['Teak Finish', 'Solid Sheesham', 'Engineered Oak', 'Performance Linen', 'Breathable Fabric', 'Matte Stainless', 'Frosted Glass', 'Brushed Copper'];
const TAG_POOL = ['best-selling', 'popular', 'trending', 'new-arrival', 'featured', 'deal', 'limited'];

const imageMap = {
  sofas: IMG.products.sofa,
  beds: IMG.products.bed,
  wardrobes: IMG.products.wardrobe,
  'dining-sets': IMG.products.dining,
  'study-tables': IMG.products.study,
  mattresses: IMG.products.mattress,
  decor: IMG.products.decor,
  storage: IMG.products.storage,
  refrigerators: IMG.products.refrigerator,
  'washing-machines': IMG.products.washer,
  'air-conditioners': IMG.products.ac,
  televisions: IMG.products.tv,
  microwaves: IMG.products.microwave,
  chimneys: IMG.products.chimney,
  'water-purifiers': IMG.products.purifier
};

async function seedCrm() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'rf-riddhy';
  if (!uri) {
    console.error('ERROR: MONGODB_URI not defined');
    process.exit(1);
  }

  console.log(`[Seed CRM] Connecting to MongoDB (${dbName})...`);
  await mongoose.connect(uri, { dbName });
  console.log('[Seed CRM] Connected.');

  try {
    // 1. Ensure Categories exist
    console.log('[Seed CRM] Ensuring categories in database...');
    for (const cat of CATEGORY_SEED) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          $set: {
            name: cat.name,
            slug: cat.slug,
            type: cat.type,
            room: cat.room,
            active: true
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    // 2. Ensure Warehouse exists
    const warehouseCode = process.env.DEFAULT_WAREHOUSE_CODE || 'DELHI-01';
    const warehouse = await Warehouse.findOneAndUpdate(
      { code: warehouseCode },
      { $setOnInsert: { code: warehouseCode, name: 'Delhi Central Fulfilment Hub', active: true } },
      { upsert: true, new: true }
    );

    // 3. Seed 500 products
    const existingCount = await Product.countDocuments();
    console.log(`[Seed CRM] Current product count: ${existingCount}`);

    const targetProducts = 500;
    if (existingCount < targetProducts) {
      const toGenerate = targetProducts - existingCount;
      console.log(`[Seed CRM] Seeding ${toGenerate} additional products to reach ${targetProducts}...`);

      const categories = await Category.find({ active: true }).lean();

      for (let i = 1; i <= toGenerate; i++) {
        const cat = categories[i % categories.length];
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const mat = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
        const indexNumber = existingCount + i;
        const name = `${adj} ${cat.name.replace(/ & .*/, '')} Series ${indexNumber} (${mat})`;
        const slug = `${cat.slug}-${adj.toLowerCase()}-${indexNumber}`;
        const sku = `RF-${cat.slug.slice(0, 3).toUpperCase()}-${String(indexNumber).padStart(4, '0')}`;

        const basePrice = Math.floor(Math.random() * 60 + 5) * 1000 + 990; // e.g. 5,990 to 64,990
        const mrp = Math.round(basePrice * (1 + (Math.random() * 0.35 + 0.1)));
        const discount = Math.round(((mrp - basePrice) / mrp) * 100);

        // Stock distribution: 75% in-stock (>5), 15% low-stock (1..5), 10% out-of-stock (0)
        let stock = 0;
        const stockRoll = Math.random();
        if (stockRoll < 0.1) stock = 0;
        else if (stockRoll < 0.25) stock = Math.floor(Math.random() * 4) + 1;
        else stock = Math.floor(Math.random() * 40) + 6;

        // Tags distribution
        const tags = [];
        if (Math.random() < 0.2) tags.push('best-selling');
        if (Math.random() < 0.25) tags.push('popular');
        if (Math.random() < 0.2) tags.push('trending');
        if (Math.random() < 0.2) tags.push('new-arrival');
        if (Math.random() < 0.15) tags.push('deal');

        const statusRoll = Math.random();
        const status = statusRoll < 0.85 ? 'active' : statusRoll < 0.95 ? 'draft' : 'archived';

        const image = imageMap[cat.slug] || IMG.products.sofa;
        const gallery = [
          { url: image, thumbUrl: image, alt: `${name} primary view`, sortOrder: 0 },
          { url: image, thumbUrl: image, alt: `${name} alternate angle`, sortOrder: 1 }
        ];

        const sales30d = tags.includes('best-selling') ? Math.floor(Math.random() * 80) + 20 : Math.floor(Math.random() * 15);

        const product = await Product.create({
          name,
          slug,
          category: cat.slug,
          categoryId: cat._id,
          categoryLabel: cat.name,
          type: cat.type,
          brand: 'RF Riddhy',
          price: basePrice,
          mrp,
          discount,
          stock,
          status,
          tags,
          sales30d,
          salesTotal: sales30d * basePrice,
          views30d: Math.floor(Math.random() * 500) + 50,
          wishlistCount: Math.floor(Math.random() * 30),
          image,
          gallery,
          badgeText: tags.includes('best-selling') ? 'Bestseller' : tags.includes('deal') ? 'Special Offer' : '',
          hsnCode: cat.type === 'appliance' ? '8516' : '9403',
          description: `Handcrafted ${cat.name.toLowerCase()} engineered for modern Indian living. Built with high-density durability, ergonomic design, and premium aesthetics.`,
          warranty: {
            durationDays: 365,
            durationYears: 1,
            coverage: '1 year comprehensive warranty with free doorstep technician visit.',
            startsOn: 'purchase'
          },
          isDemo: false
        });

        const variant = await Variant.create({
          productId: product._id,
          sku,
          price: basePrice,
          mrp,
          stock,
          active: status === 'active',
          attributes: { finish: mat }
        });

        await Inventory.create({
          variantId: variant._id,
          warehouseId: warehouse._id,
          available: stock,
          reserved: 0,
          lowStockAt: 4
        });

        if (stock > 0) {
          await StockMovement.create({
            variantId: variant._id,
            warehouseId: warehouse._id,
            kind: 'opening',
            quantity: stock,
            reference: `seed:${product.slug}`
          });
        }
      }
      console.log(`[Seed CRM] Finished seeding products! Total products now: ${await Product.countDocuments()}`);
    } else {
      console.log(`[Seed CRM] Already have ${existingCount} products, skipping product generation.`);
    }

    // 4. Seed Orders (200 orders with mixed statuses)
    const existingOrdersCount = await Order.countDocuments();
    console.log(`[Seed CRM] Current order count: ${existingOrdersCount}`);

    const targetOrders = 200;
    if (existingOrdersCount < targetOrders) {
      const ordersToCreate = targetOrders - existingOrdersCount;
      console.log(`[Seed CRM] Seeding ${ordersToCreate} orders with realistic items, payments, warranties...`);

      const products = await Product.find({ status: 'active' }).limit(40).lean();
      const statuses = ['paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'installed', 'completed', 'payment_pending', 'cancelled', 'refunded'];

      const customerNames = [
        ['Aarav Sharma', 'aarav.sharma@example.com', '+91 98111 22334', 'Delhi', '110001'],
        ['Diya Patel', 'diya.patel@example.com', '+91 98222 33445', 'Ahmedabad', '380001'],
        ['Rohan Iyer', 'rohan.iyer@example.com', '+91 98333 44556', 'Bengaluru', '560001'],
        ['Ananya Sen', 'ananya.sen@example.com', '+91 98444 55667', 'Kolkata', '700001'],
        ['Vikram Malhotra', 'vikram.m@example.com', '+91 98555 66778', 'Mumbai', '400001'],
        ['Meera Nair', 'meera.nair@example.com', '+91 98666 77889', 'Kochi', '682001'],
        ['Kabir Verma', 'kabir.v@example.com', '+91 98777 88990', 'Gurugram', '122001']
      ];

      for (let j = 1; j <= ordersToCreate; j++) {
        const cust = customerNames[j % customerNames.length];
        const status = statuses[j % statuses.length];
        const paymentStatus = ['paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'installed', 'completed'].includes(status)
          ? 'paid'
          : status === 'refunded'
          ? 'refunded'
          : status === 'cancelled'
          ? 'unpaid'
          : 'pending';

        const p1 = products[j % products.length];
        const p2 = products[(j + 3) % products.length];
        const orderNumber = `RF-ORD-2026-${String(existingOrdersCount + j).padStart(5, '0')}`;

        const items = [
          {
            productId: p1._id,
            name: p1.name,
            sku: `RF-SKU-${p1._id.toString().slice(-4).toUpperCase()}`,
            qty: 1,
            unitPrice: p1.price,
            mrp: p1.mrp,
            lineTotal: p1.price,
            warrantySnapshot: { durationDays: 365, coverage: '1 year standard' }
          }
        ];

        let subtotal = p1.price;
        if (j % 2 === 0 && p2) {
          items.push({
            productId: p2._id,
            name: p2.name,
            sku: `RF-SKU-${p2._id.toString().slice(-4).toUpperCase()}`,
            qty: 1,
            unitPrice: p2.price,
            mrp: p2.mrp,
            lineTotal: p2.price,
            warrantySnapshot: { durationDays: 365, coverage: '1 year standard' }
          });
          subtotal += p2.price;
        }

        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;

        const order = await Order.create({
          orderNumber,
          email: cust[1],
          phone: cust[2],
          status,
          paymentStatus,
          paymentMethod: 'razorpay',
          items,
          subtotal,
          tax,
          total,
          shippingAddress: {
            name: cust[0],
            phone: cust[2],
            line1: 'Flat 402, Sunshine Apartments',
            city: cust[3],
            state: cust[3] === 'Delhi' || cust[3] === 'Gurugram' ? 'Delhi' : 'Maharashtra',
            pincode: cust[4]
          },
          billingAddress: {
            name: cust[0],
            phone: cust[2],
            line1: 'Flat 402, Sunshine Apartments',
            city: cust[3],
            state: cust[3] === 'Delhi' || cust[3] === 'Gurugram' ? 'Delhi' : 'Maharashtra',
            pincode: cust[4]
          },
          deliveredAt: ['delivered', 'installed', 'completed'].includes(status) ? new Date(Date.now() - 10 * 86400000) : undefined,
          installedAt: ['installed', 'completed'].includes(status) ? new Date(Date.now() - 8 * 86400000) : undefined,
          timeline: [
            { status: 'draft_cart', at: new Date(Date.now() - 15 * 86400000), note: 'Cart created' },
            { status: 'paid', at: new Date(Date.now() - 14 * 86400000), note: 'Payment verified via Razorpay' }
          ]
        });

        // Create payment record
        if (paymentStatus === 'paid') {
          await Payment.create({
            orderId: order._id,
            provider: 'razorpay',
            providerOrderId: `order_seed_${j}`,
            providerPaymentId: `pay_seed_${j}`,
            amount: total,
            status: 'captured'
          });

          // Create warranty registrations
          for (let u = 0; u < items.length; u++) {
            const it = items[u];
            const purchaseDate = new Date(Date.now() - 14 * 86400000);
            const expiryDate = new Date(purchaseDate.getTime() + 365 * 86400000);
            await ProductRegistration.findOneAndUpdate(
              { orderId: order._id, sku: it.sku, unitIndex: 0 },
              {
                $setOnInsert: {
                  orderId: order._id,
                  orderNumber: order.orderNumber,
                  productId: it.productId,
                  productName: it.name,
                  sku: it.sku,
                  unitIndex: 0,
                  customerName: cust[0],
                  customerPhone: cust[2],
                  customerEmail: cust[1],
                  purchaseDate,
                  activationDate: purchaseDate,
                  expiryDate,
                  durationDays: 365,
                  status: 'active',
                  verified: true,
                  source: 'seller',
                  registeredFrom: 'order'
                }
              },
              { upsert: true }
            );
          }
        }
      }
      console.log(`[Seed CRM] Finished seeding orders! Total orders now: ${await Order.countDocuments()}`);
    }

    console.log('[Seed CRM] Demo data seeding completed successfully!');
  } catch (err) {
    console.error('[Seed CRM Error]', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed CRM] Disconnected from MongoDB.');
  }
}

seedCrm();
