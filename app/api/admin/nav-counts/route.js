import { connectDB } from '@/lib/db';
import { Order, Inventory, WarrantyClaim, Lead } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actor = await requireAdmin(
    new Set(['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance'])
  );
  if (!actor) {
    return fail('Admin permission required.', 403);
  }

  try {
    await connectDB();

    const [pendingOrders, lowStock, openClaims, newLeads] = await Promise.all([
      Order.countDocuments({
        status: { $in: ['payment_pending', 'confirmed', 'processing', 'packed', 'ready_for_dispatch'] }
      }),
      Inventory.countDocuments({
        $expr: { $lte: ['$available', '$lowStockAt'] }
      }),
      WarrantyClaim.countDocuments({
        status: { $in: ['submitted', 'under_review'] }
      }),
      Lead.countDocuments({
        status: 'new'
      })
    ]);

    const res = ok({
      pendingOrders,
      lowStock,
      openClaims,
      newLeads
    });

    res.headers.set('Cache-Control', 'private, max-age=60');
    return res;
  } catch (error) {
    return apiError(error);
  }
}
