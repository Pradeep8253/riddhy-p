import { connectDB } from '@/lib/db';
import { Order, ProductRegistration, WarrantyPolicy, Product } from '@/models/index';

/**
 * Calculate remaining days until expiry in Asia/Kolkata timezone.
 */
export function daysRemaining(expiryDate, now = new Date()) {
  if (!expiryDate) return 0;
  const zone = 'Asia/Kolkata';
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const localDay = (date) => fmt.format(new Date(date));
  const [ny, nm, nd] = localDay(now).split('-').map(Number);
  const [ey, em, ed] = localDay(expiryDate).split('-').map(Number);
  const todayUTC = Date.UTC(ny, nm - 1, nd);
  const expiryUTC = Date.UTC(ey, em - 1, ed);
  return Math.max(0, Math.ceil((expiryUTC - todayUTC) / 86400000));
}

/**
 * Determine status from expiry date.
 */
export function computeWarrantyStatus(expiryDate, now = new Date()) {
  if (!expiryDate) return 'expired';
  const days = daysRemaining(expiryDate, now);
  if (days <= 0) return 'expired';
  if (days <= 30) return 'expiring_soon';
  return 'active';
}

/**
 * Extract duration in days from text or snapshot.
 * e.g. "2 years" -> 730, "1 year" -> 365, "10 years" -> 3650
 */
export function parseWarrantyDurationDays(warrantySnapshot, defaultDays = 365) {
  if (!warrantySnapshot) return defaultDays;
  if (typeof warrantySnapshot === 'number') return warrantySnapshot;

  const text = typeof warrantySnapshot === 'string'
    ? warrantySnapshot
    : [warrantySnapshot.seller, warrantySnapshot.manufacturer, warrantySnapshot.compressor].filter(Boolean).join(' ');

  const yearMatch = text.match(/(\d+)\s*(?:year|yr)/i);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10) * 365;
  }

  const monthMatch = text.match(/(\d+)\s*(?:month|mo)/i);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) * 30;
  }

  return defaultDays;
}

export function warrantyStartsAt({ deliveredAt, installedAt, purchaseDate, rule = 'purchase' }) {
  if (rule === 'installation' && installedAt) return new Date(installedAt);
  if (rule === 'delivery' && deliveredAt) return new Date(deliveredAt);
  if (purchaseDate) return new Date(purchaseDate);
  if (deliveredAt) return new Date(deliveredAt);
  return new Date();
}

/**
 * Idempotently auto-register warranty for all items in an order upon payment or delivery.
 * Qty 3 -> 3 registrations, each with unitIndex 0, 1, 2.
 */
export async function autoRegisterOrderWarranties(orderId) {
  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order || !order.items || !order.items.length) return [];

  const created = [];
  const purchaseDate = order.createdAt || new Date();
  const activationDate = order.deliveredAt || purchaseDate;

  for (const item of order.items) {
    const qty = Number(item.qty || 1);
    const durationDays = parseWarrantyDurationDays(item.warrantySnapshot, item.sku?.startsWith('APP') ? 365 : 730);
    const expiryDate = new Date(activationDate.getTime() + durationDays * 86400000);
    const status = computeWarrantyStatus(expiryDate);

    for (let unitIndex = 0; unitIndex < qty; unitIndex++) {
      // Check if registration already exists for (orderId, sku, unitIndex)
      const existing = await ProductRegistration.findOne({
        orderId: order._id,
        sku: item.sku,
        unitIndex
      }).lean();

      if (existing) {
        created.push(existing);
        continue;
      }

      const regData = {
        userId: order.userId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        productId: item.productId,
        productName: item.name,
        variantId: item.variantId,
        sku: item.sku,
        unitIndex,
        customerName: order.shippingAddress?.name || order.billingAddress?.name || 'Customer',
        customerPhone: order.phone || order.shippingAddress?.phone,
        customerEmail: order.email,
        purchaseDate,
        activationDate,
        expiryDate,
        durationDays,
        source: 'seller',
        registeredFrom: 'order',
        verified: true,
        status
      };

      try {
        const doc = await ProductRegistration.create(regData);
        created.push(doc.toObject());
      } catch (err) {
        // Ignore duplicate index errors on race conditions
        if (err.code !== 11000) {
          console.warn('Warranty registration error:', err.message);
        }
      }
    }
  }

  return created;
}

/**
 * Register a late / offline purchase submitted by customer.
 * Warranty starts from purchaseDate (not registration date).
 */
export async function registerLatePurchase({
  orderNumber,
  sku,
  serialNumber,
  purchaseDate,
  proofOfPurchase,
  customerName,
  customerPhone,
  customerEmail,
  userId,
  source = 'seller'
}) {
  await connectDB();

  const pDate = new Date(purchaseDate);
  const now = new Date();
  if (isNaN(pDate.getTime())) {
    throw new Error('Invalid purchase date.');
  }
  if (pDate > now) {
    throw new Error('Purchase date cannot be in the future.');
  }

  // Check if serial number is already registered
  const cleanSerial = (serialNumber || '').trim();
  if (cleanSerial) {
    const existingSerial = await ProductRegistration.findOne({ serialNumber: cleanSerial });
    if (existingSerial) {
      throw new Error(`Serial number ${cleanSerial} is already registered.`);
    }
  }

  // Check if website order number already has an auto-registration
  if (orderNumber) {
    const existingOrderReg = await ProductRegistration.findOne({ orderNumber, sku });
    if (existingOrderReg) {
      if (cleanSerial && !existingOrderReg.serialNumber) {
        existingOrderReg.serialNumber = cleanSerial;
        await existingOrderReg.save();
        return { ...existingOrderReg.toObject(), attachedSerial: true };
      }
      throw new Error(`Order ${orderNumber} already has an active registration for ${sku}.`);
    }
  }

  // Look up product warranty duration
  const product = await Product.findOne({
    $or: [{ sku }, { 'variants.sku': sku }]
  }).lean().catch(() => null);

  const durationDays = parseWarrantyDurationDays(product?.warranty, 365);
  // Warranty counts from purchaseDate
  const expiryDate = new Date(pDate.getTime() + durationDays * 86400000);
  const status = computeWarrantyStatus(expiryDate, now);

  const regDoc = {
    userId,
    orderNumber: orderNumber || 'OFFLINE',
    sku,
    productName: product?.name || `Product (${sku})`,
    productId: product?._id,
    customerName,
    customerPhone,
    customerEmail,
    purchaseDate: pDate,
    activationDate: pDate,
    expiryDate,
    durationDays,
    proofOfPurchase,
    source,
    registeredFrom: orderNumber ? 'website' : 'offline',
    verified: false, // Offline registrations enter admin review queue
    status
  };

  if (cleanSerial) {
    regDoc.serialNumber = cleanSerial;
  }

  const registration = await ProductRegistration.create(regDoc);
  return registration.toObject ? registration.toObject() : registration;
}
