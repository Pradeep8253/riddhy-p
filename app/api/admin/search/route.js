import { connectDB } from '@/lib/db';
import { Order, Product, Lead } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const actor = await requireAdmin(
    new Set(['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance'])
  );
  if (!actor) return fail('Admin permission required.', 403);

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return ok({ orders: [], products: [], leads: [] });
    }

    await connectDB();
    const regex = new RegExp(q, 'i');

    const [orders, products, leads] = await Promise.all([
      // Search Orders
      Order.find({
        $or: [
          { orderNumber: regex },
          { phone: regex },
          { 'shippingAddress.name': regex },
          { 'billingAddress.name': regex }
        ]
      })
        .select('orderNumber phone total status paymentStatus createdAt')
        .limit(5)
        .lean(),

      // Search Products
      Product.find({
        $or: [{ name: regex }, { slug: regex }, { category: regex }]
      })
        .select('name slug category price stock image')
        .limit(5)
        .lean(),

      // Search Leads / Inquiries
      Lead.find({
        $or: [{ name: regex }, { phone: regex }, { email: regex }]
      })
        .select('name phone type status createdAt')
        .limit(5)
        .lean()
        .catch(() => [])
    ]);

    return ok({
      orders: orders.map((o) => ({
        id: String(o._id),
        title: o.orderNumber,
        subtitle: `${o.phone || 'No phone'} · ₹${(o.total || 0).toLocaleString('en-IN')}`,
        badge: o.status,
        href: `/admin/orders?orderNumber=${o.orderNumber}`
      })),
      products: products.map((p) => ({
        id: String(p._id),
        title: p.name,
        subtitle: `${p.category} · ₹${(p.price || 0).toLocaleString('en-IN')}`,
        badge: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
        href: `/admin/catalogue?search=${encodeURIComponent(p.name)}`
      })),
      leads: leads.map((l) => ({
        id: String(l._id),
        title: l.name || 'Lead',
        subtitle: `${l.phone || ''} · ${l.type || 'Inquiry'}`,
        badge: l.status || 'new',
        href: `/admin/leads?search=${encodeURIComponent(l.name || l.phone || '')}`
      }))
    });
  } catch (error) {
    return apiError(error);
  }
}
