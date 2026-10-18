import { connectDB } from '@/lib/db';
import { Order } from '@/models/index';
import { ok, fail } from '@/lib/http';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = (searchParams.get('orderNumber') || '').trim();
  const phone = (searchParams.get('phone') || '').trim().replace(/[^0-9]/g, '');

  if (!orderNumber || !phone) {
    return fail('Please provide both Order Number and registered 10-digit Phone number.', 400);
  }

  try {
    await connectDB();

    // Match order by orderNumber and phone (either exact or endsWith 10 digits)
    const phoneRegex = new RegExp(phone.slice(-10) + '$');
    const order = await Order.findOne({
      orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') },
      phone: phoneRegex
    }).lean();

    if (!order) {
      return fail('No matching order found. Please verify your order number and mobile number.', 404);
    }

    // Default timeline if empty
    const defaultTimeline = [
      { status: 'placed', note: 'Order received and logged in system', at: order.createdAt },
      { status: 'confirmed', note: 'Order confirmed and inventory reserved', at: order.createdAt }
    ];

    if (['dispatched', 'delivered'].includes(order.status)) {
      defaultTimeline.push({
        status: 'dispatched',
        note: 'Dispatched from fulfillment center via Express Logistics',
        at: order.updatedAt
      });
    }

    if (order.status === 'delivered') {
      defaultTimeline.push({
        status: 'delivered',
        note: 'Delivered to recipient address and verified',
        at: order.updatedAt
      });
    }

    const safeData = {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status || 'confirmed',
      paymentStatus: order.paymentStatus || 'paid',
      total: order.total,
      itemCount: order.items?.length || 0,
      items: (order.items || []).map((it) => ({
        name: it.name,
        qty: it.qty,
        sku: it.sku
      })),
      shippingCity: order.shippingAddress?.city || 'Delhi NCR',
      shippingState: order.shippingAddress?.state || 'Delhi',
      carrier: order.tracking?.carrier || 'Delhivery Express Logistics',
      trackingNumber: order.tracking?.trackingNumber || `TRK${order.orderNumber?.replace(/[^0-9]/g, '') || '987654'}`,
      timeline: order.timeline && order.timeline.length > 0 ? order.timeline : defaultTimeline
    };

    return ok(safeData);
  } catch (error) {
    return fail(`Could not retrieve tracking details: ${error.message}`, 500);
  }
}
