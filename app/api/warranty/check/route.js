import { connectDB } from '@/lib/db';
import { ProductRegistration } from '@/models/index';
import { ok, fail } from '@/lib/http';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`warranty-check:${ip}`, { limit: 30, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return fail('Too many search requests. Please wait a moment.', 429);
  }

  const url = new URL(request.url);
  const serial = url.searchParams.get('serial')?.trim();
  const phone = url.searchParams.get('phone')?.trim();
  const orderNumber = url.searchParams.get('orderNumber')?.trim();

  if (!serial && (!phone || !orderNumber)) {
    return fail('Please provide either a Serial Number OR both Phone Number and Order Number.', 400);
  }

  try {
    if (!process.env.MONGODB_URI) {
      // Demo response if database not connected
      return ok({
        registrations: [
          {
            id: 'demo-reg-1',
            productName: 'Solid Sheesham King Size Bed',
            serialNumber: serial || 'RF-SH-2026-8812',
            orderNumber: orderNumber || 'RF-ORD-9021',
            customerName: 'Verified Buyer',
            purchaseDate: '2025-11-15',
            activationDate: '2025-11-15',
            expiryDate: '2028-11-15',
            durationDays: 1095,
            remainingDays: 760,
            status: 'active',
            coverage: '5-Year Structural Termite & Borer Warranty + 3-Year Hardware Warranty'
          }
        ]
      });
    }

    await connectDB();
    const query = {};
    if (serial) {
      query.serialNumber = { $regex: new RegExp(`^${serial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    } else {
      query.customerPhone = phone;
      query.orderNumber = { $regex: new RegExp(`^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    const docs = await ProductRegistration.find(query).sort({ createdAt: -1 }).limit(10).lean();

    if (!docs || docs.length === 0) {
      return fail('No warranty registration found for the provided details. Please verify your serial number or order details, or register your product on the registration tab.', 404);
    }

    const now = Date.now();
    const results = docs.map((doc) => {
      const exp = new Date(doc.expiryDate);
      const remainingDays = Math.max(0, Math.ceil((exp.getTime() - now) / 86400000));
      let currentStatus = 'active';
      if (remainingDays <= 0) {
        currentStatus = 'expired';
      } else if (remainingDays <= 30) {
        currentStatus = 'expiring_soon';
      }

      return {
        id: String(doc._id),
        productName: doc.productName,
        serialNumber: doc.serialNumber,
        orderNumber: doc.orderNumber,
        customerName: doc.customerName,
        purchaseDate: doc.purchaseDate ? new Date(doc.purchaseDate).toISOString().split('T')[0] : '',
        activationDate: doc.activationDate ? new Date(doc.activationDate).toISOString().split('T')[0] : '',
        expiryDate: exp.toISOString().split('T')[0],
        durationDays: doc.durationDays,
        remainingDays,
        status: currentStatus,
        verified: doc.verified
      };
    });

    return ok({ registrations: results });
  } catch (error) {
    return fail(`Failed to retrieve warranty status: ${error.message}`, 500);
  }
}
