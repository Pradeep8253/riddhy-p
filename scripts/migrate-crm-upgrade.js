import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Product,
  Variant,
  Inventory,
  Order,
  Invoice,
  CreditNote,
  SequenceCounter,
  ProductRegistration,
  WarrantyClaim,
  Media,
  AdminUser,
  SiteSetting
} from '../models/index.js';

async function migrate() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'rf-riddhy';
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in environment.');
    process.exit(1);
  }

  console.log(`[Migration] Connecting to MongoDB (${dbName})...`);
  await mongoose.connect(uri, { dbName });
  console.log('[Migration] Connected successfully.');

  try {
    // 1. Ensure indexes on all upgraded models
    console.log('[Migration] Ensuring indexes on models...');
    await Product.init();
    await Variant.init();
    await Inventory.init();
    await Order.init();
    await Invoice.init();
    await CreditNote.init();
    await SequenceCounter.init();
    await ProductRegistration.init();
    await WarrantyClaim.init();
    await Media.init();
    await AdminUser.init();
    await SiteSetting.init();
    console.log('[Migration] Indexes initialized.');

    // 2. Backfill Product defaults
    console.log('[Migration] Backfilling product defaults (tags, gallery, metrics)...');
    const products = await Product.find({});
    let updatedProducts = 0;

    for (const p of products) {
      let changed = false;

      // Gallery backfill from image
      if (!p.gallery || p.gallery.length === 0) {
        if (p.image) {
          p.gallery = [{
            url: p.image,
            thumbUrl: p.image,
            alt: p.imageAlt || p.name || 'Product Image',
            sortOrder: 0
          }];
          changed = true;
        } else {
          p.gallery = [];
        }
      }

      // Tags backfill
      if (!p.tags) {
        p.tags = [];
        changed = true;
      }

      // Tag overrides
      if (!p.tagOverrides) {
        p.tagOverrides = { pin: [], hide: [] };
        changed = true;
      }

      // Metrics
      if (p.sales30d === undefined || p.sales30d === null) { p.sales30d = 0; changed = true; }
      if (p.views30d === undefined || p.views30d === null) { p.views30d = 0; changed = true; }
      if (p.wishlistCount === undefined || p.wishlistCount === null) { p.wishlistCount = 0; changed = true; }
      if (p.salesTotal === undefined || p.salesTotal === null) { p.salesTotal = 0; changed = true; }
      if (!p.hsnCode) { p.hsnCode = p.type === 'appliance' ? '8516' : '9403'; changed = true; }

      if (changed) {
        await p.save();
        updatedProducts++;
      }
    }
    console.log(`[Migration] Backfilled ${updatedProducts} of ${products.length} products.`);

    // 3. Backfill SiteSetting company info
    console.log('[Migration] Ensuring SiteSetting has company & tax config...');
    const setting = await SiteSetting.findOne({ key: 'site_config' });
    if (!setting) {
      await SiteSetting.create({
        key: 'site_config',
        company: {
          legalName: process.env.COMPANY_LEGAL_NAME || 'RF Riddhy Furniture & Appliances Pvt Ltd',
          tradeName: process.env.COMPANY_TRADE_NAME || 'RF Riddhy',
          gstin: process.env.COMPANY_GSTIN || '07AAAAA0000A1Z5',
          pan: process.env.COMPANY_PAN || 'AAAAA0000A',
          state: process.env.COMPANY_STATE || 'Delhi',
          stateCode: process.env.COMPANY_STATE_CODE || '07',
          addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'Plot 42, Okhla Industrial Area Phase III',
          city: process.env.COMPANY_CITY || 'New Delhi',
          pincode: process.env.COMPANY_PINCODE || '110020',
          phone: process.env.COMPANY_PHONE || '+91 98765 43210',
          email: process.env.COMPANY_EMAIL || 'billing@rfriddhy.com',
          invoicePrefix: process.env.INVOICE_PREFIX || 'RF',
          invoiceGenerationTiming: process.env.INVOICE_TIMING || 'paid',
          warrantyStartsOn: 'purchase'
        }
      });
      console.log('[Migration] Created default SiteSetting.');
    } else if (!setting.company || !setting.company.gstin) {
      setting.company = {
        legalName: process.env.COMPANY_LEGAL_NAME || 'RF Riddhy Furniture & Appliances Pvt Ltd',
        tradeName: process.env.COMPANY_TRADE_NAME || 'RF Riddhy',
        gstin: process.env.COMPANY_GSTIN || '07AAAAA0000A1Z5',
        pan: process.env.COMPANY_PAN || 'AAAAA0000A',
        state: process.env.COMPANY_STATE || 'Delhi',
        stateCode: process.env.COMPANY_STATE_CODE || '07',
        addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'Plot 42, Okhla Industrial Area Phase III',
        city: process.env.COMPANY_CITY || 'New Delhi',
        pincode: process.env.COMPANY_PINCODE || '110020',
        phone: process.env.COMPANY_PHONE || '+91 98765 43210',
        email: process.env.COMPANY_EMAIL || 'billing@rfriddhy.com',
        invoicePrefix: process.env.INVOICE_PREFIX || 'RF',
        invoiceGenerationTiming: process.env.INVOICE_TIMING || 'paid',
        warrantyStartsOn: 'purchase',
        ...(setting.company || {})
      };
      await setting.save();
      console.log('[Migration] Updated SiteSetting company config.');
    }

    // 4. Backfill Warranty Registrations for Paid/Delivered orders
    console.log('[Migration] Checking warranty backfill for paid/delivered orders...');
    const paidOrders = await Order.find({
      $or: [
        { paymentStatus: 'paid' },
        { status: { $in: ['paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'installed', 'completed'] } }
      ]
    }).lean();

    let createdRegs = 0;
    for (const order of paidOrders) {
      if (!order.items || order.items.length === 0) continue;

      for (const item of order.items) {
        const qty = item.qty || 1;
        for (let unitIndex = 0; unitIndex < qty; unitIndex++) {
          const existing = await ProductRegistration.findOne({
            orderId: order._id,
            sku: item.sku,
            unitIndex
          });

          if (!existing) {
            const purchaseDate = order.createdAt || new Date();
            const durationDays = item.warrantySnapshot?.durationDays || 365;
            const expiryDate = new Date(purchaseDate.getTime() + durationDays * 86400000);

            await ProductRegistration.create({
              userId: order.userId,
              orderId: order._id,
              orderNumber: order.orderNumber,
              productId: item.productId,
              productName: item.name,
              variantId: item.variantId,
              sku: item.sku,
              unitIndex,
              customerName: order.shippingAddress?.name || 'Valued Customer',
              customerPhone: order.shippingAddress?.phone || order.phone || '',
              customerEmail: order.email || '',
              purchaseDate,
              activationDate: purchaseDate,
              expiryDate,
              durationDays,
              source: 'seller',
              registeredFrom: 'order',
              status: expiryDate > new Date() ? 'active' : 'expired',
              verified: true
            });
            createdRegs++;
          }
        }
      }
    }
    console.log(`[Migration] Backfilled ${createdRegs} warranty registrations.`);

    console.log('[Migration] All migrations completed successfully.');
  } catch (err) {
    console.error('[Migration Error]', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Migration] Disconnected from MongoDB.');
  }
}

migrate();
