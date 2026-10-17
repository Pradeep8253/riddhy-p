import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ProductRegistration, Order, AuditLog } from '@/models/index';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const registerSchema = z.object({
  orderNumber: z.string().optional(),
  productName: z.string().min(2, 'Product name is required'),
  serialNumber: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  durationDays: z.coerce.number().int().min(30).max(3650).default(365),
  proofOfPurchase: z.string().optional(),
  category: z.string().optional()
});

export async function POST(request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`warranty-reg:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return fail('Too many registration requests. Please try again later.', 429);
  }

  const body = await jsonBody(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Validation error in warranty registration', 422, parsed.error.flatten());
  }

  const data = parsed.data;

  // Calculate activation & expiry dates
  const purchase = new Date(data.purchaseDate);
  if (isNaN(purchase.getTime()) || purchase > new Date()) {
    return fail('Purchase date cannot be in the future.', 400);
  }

  // Determine warranty duration: default 365 days (1 year), 730 days (2 years) for appliances if specified
  let duration = data.durationDays || 365;
  if (data.category && data.category.toLowerCase().includes('appliance')) {
    duration = Math.max(duration, 730);
  }

  const activationDate = purchase;
  const expiryDate = new Date(activationDate.getTime() + duration * 86400000);
  const now = Date.now();
  const remainingDays = Math.max(0, Math.ceil((expiryDate.getTime() - now) / 86400000));

  let status = 'active';
  if (remainingDays <= 0) {
    status = 'expired';
  } else if (remainingDays <= 30) {
    status = 'expiring_soon';
  }

  const cleanSerial = data.serialNumber ? data.serialNumber.trim().toUpperCase() : null;

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();

      // Duplicate guard: check serial number
      if (cleanSerial) {
        const existing = await ProductRegistration.findOne({ serialNumber: cleanSerial });
        if (existing) {
          return fail(
            `A warranty has already been registered for serial number ${cleanSerial}. You can check your remaining warranty on the warranty status tab.`,
            409
          );
        }
      }

      // Check if orderNumber matches an existing Order
      let orderId = null;
      if (data.orderNumber) {
        const matchingOrder = await Order.findOne({ orderNumber: data.orderNumber.trim() }).lean();
        if (matchingOrder) {
          orderId = matchingOrder._id;
        }
      }

      const regPayload = {
        orderNumber: data.orderNumber ? data.orderNumber.trim() : 'OFFLINE',
        orderId,
        productName: data.productName.trim(),
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
        customerEmail: data.customerEmail ? data.customerEmail.trim() : '',
        purchaseDate: purchase,
        activationDate,
        expiryDate,
        durationDays: duration,
        proofOfPurchase: data.proofOfPurchase || '',
        status,
        verified: Boolean(orderId), // Verified if matched to existing system order; false for review queue
        registeredFrom: orderId ? 'website' : 'offline'
      };

      if (cleanSerial) {
        regPayload.serialNumber = cleanSerial;
      }

      const doc = await ProductRegistration.create(regPayload);

      return ok(
        {
          registrationId: String(doc._id),
          serialNumber: cleanSerial || undefined,
          productName: doc.productName,
          status,
          purchaseDate: purchase.toISOString().split('T')[0],
          activationDate: activationDate.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0],
          durationDays: duration,
          remainingDays,
          verified: doc.verified,
          message: doc.verified
            ? 'Warranty registered and verified successfully.'
            : 'Warranty registration received. Our operations desk will review proof of purchase within 24 hours.'
        },
        201
      );
    }

    // Demo/offline fallback response
    return ok(
      {
        registrationId: `REG-DEMO-${Date.now().toString().slice(-6)}`,
        serialNumber: cleanSerial || 'N/A',
        productName: data.productName,
        status,
        purchaseDate: purchase.toISOString().split('T')[0],
        activationDate: activationDate.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        durationDays: duration,
        remainingDays,
        message: 'Warranty registered successfully in demo mode.'
      },
      201
    );
  } catch (error) {
    if (error.code === 11000) {
      return fail('This serial number has already been registered.', 409);
    }
    return fail(`Registration failed: ${error.message}`, 500);
  }
}
