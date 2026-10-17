import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Order, Payment, Invoice, AuditLog, ProductRegistration, WarrantyPolicy } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { applyOrderTransition } from '@/lib/order-state';
import { generateInvoiceForOrder, generateCreditNoteForRefund } from '@/lib/invoice-generator';

const patchSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum(['transition', 'recordPayment', 'markCodCollected', 'issueInvoice', 'processRefund']).default('transition'),
  status: z.string().optional(),
  note: z.string().max(500).optional(),
  // Offline Payment payload
  payment: z.object({
    amount: z.number().positive(),
    mode: z.enum(['cash', 'upi', 'pos', 'bank_transfer', 'cheque']).default('cash'),
    reference: z.string().optional(),
    notes: z.string().optional()
  }).optional(),
  // Refund payload
  refund: z.object({
    amount: z.number().positive(),
    reason: z.string().min(2)
  }).optional()
});

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support', 'warehouse', 'finance']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);

    const q = (url.searchParams.get('q') || '').trim();
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const paymentMethod = url.searchParams.get('paymentMethod');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') || 25)));
    const sortParam = url.searchParams.get('sort') || 'createdAt:desc';

    // Parse sort
    const [sortField, sortDir] = sortParam.split(':');
    const sortObj = { [sortField || 'createdAt']: sortDir === 'asc' ? 1 : -1 };

    // Build filter
    const filter = {};

    if (q) {
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'shippingAddress.name': { $regex: q, $options: 'i' } },
        { 'billingAddress.name': { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const toD = new Date(dateTo);
        toD.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toD;
      }
    }

    // Execute query and aggregation facets in parallel
    const [orders, total, statusFacets, paymentFacets] = await Promise.all([
      Order.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ])
    ]);

    const facets = {
      status: {},
      paymentStatus: {},
      totalRevenue: statusFacets.reduce((sum, f) => sum + (f.revenue || 0), 0)
    };
    for (const f of statusFacets) {
      if (f._id) facets.status[f._id] = f.count;
    }
    for (const p of paymentFacets) {
      if (p._id) facets.paymentStatus[p._id] = p.count;
    }

    return ok(
      orders.map((order) => ({
        ...order,
        id: String(order._id),
        _id: undefined
      })),
      200,
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        facets
      }
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support', 'warehouse', 'finance']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid order update data.', 400, parsed.error.format());
    }

    await connectDB();
    const { orderId, action, status, note, payment, refund } = parsed.data;
    const order = await Order.findById(orderId);
    if (!order) return fail('Order not found.', 404);

    const beforeState = order.status;
    const beforePaymentStatus = order.paymentStatus;

    if (action === 'transition') {
      if (!status) return fail('Target status required for transition.', 400);

      // Apply finite state transition
      applyOrderTransition(order, status, {
        actorId: actor.sub,
        actorEmail: actor.email,
        note
      });

      // Side-effect: If order reached 'paid' or 'confirmed', generate GST invoice if not present
      if (['paid', 'confirmed'].includes(status) && !order.invoiceNumber) {
        try {
          await generateInvoiceForOrder(order._id);
        } catch (invErr) {
          console.warn('Invoice auto-creation deferred:', invErr.message);
        }
      }
    } else if (action === 'recordPayment') {
      if (!payment) return fail('Payment details required.', 400);

      order.offlinePayment = {
        amount: payment.amount,
        mode: payment.mode,
        reference: payment.reference || '',
        receivedAt: new Date(),
        notes: payment.notes || ''
      };

      const paidSoFar = (order.offlinePayment?.amount || 0) + (order.total - (order.total - payment.amount));
      if (payment.amount >= (order.total || 0)) {
        order.paymentStatus = 'paid';
        order.paymentMethod = 'offline';
        // If still pending, move to paid or confirmed
        if (['draft_cart', 'reserved', 'payment_pending'].includes(order.status)) {
          applyOrderTransition(order, 'confirmed', {
            actorId: actor.sub,
            actorEmail: actor.email,
            note: `Recorded offline payment of ₹${payment.amount} (${payment.mode}). Order confirmed.`
          });
        }
        await generateInvoiceForOrder(order._id).catch(() => null);
      } else {
        order.paymentStatus = 'pending';
        order.timeline.push({
          status: order.status,
          at: new Date(),
          note: `Partial offline payment of ₹${payment.amount} recorded.`,
          by: actor.sub,
          byEmail: actor.email
        });
      }
    } else if (action === 'markCodCollected') {
      order.codCollectedAt = new Date();
      order.paymentStatus = 'paid';
      order.timeline.push({
        status: order.status,
        at: new Date(),
        note: `COD payment of ₹${order.total} collected upon delivery.`,
        by: actor.sub,
        byEmail: actor.email
      });
      await generateInvoiceForOrder(order._id).catch(() => null);
    } else if (action === 'issueInvoice') {
      await generateInvoiceForOrder(order._id);
    } else if (action === 'processRefund') {
      if (!refund) return fail('Refund details required.', 400);

      const refundAmount = Number(refund.amount);
      order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
      if (order.refundedAmount >= order.total) {
        order.paymentStatus = 'refunded';
        applyOrderTransition(order, 'refunded', {
          actorId: actor.sub,
          actorEmail: actor.email,
          note: `Processed full refund of ₹${refundAmount}. Reason: ${refund.reason}`
        });
      } else {
        order.paymentStatus = 'partially_refunded';
        order.timeline.push({
          status: order.status,
          at: new Date(),
          note: `Processed partial refund of ₹${refundAmount}. Reason: ${refund.reason}`,
          by: actor.sub,
          byEmail: actor.email
        });
      }

      // Generate statutory Credit Note
      await generateCreditNoteForRefund(order._id, refundAmount, refund.reason).catch((e) =>
        console.warn('Credit note creation deferred:', e.message)
      );
    }

    await order.save();

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: `order.${action}`,
      entity: 'Order',
      entityId: String(order._id),
      before: { status: beforeState, paymentStatus: beforePaymentStatus },
      after: { status: order.status, paymentStatus: order.paymentStatus }
    }).catch(() => null);

    return ok({
      id: String(order._id),
      status: order.status,
      paymentStatus: order.paymentStatus,
      invoiceNumber: order.invoiceNumber,
      timeline: order.timeline
    });
  } catch (error) {
    return apiError(error);
  }
}
