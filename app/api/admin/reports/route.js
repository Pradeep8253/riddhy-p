import { connectDB } from '@/lib/db';
import { Order, Payment, WarrantyClaim, Inventory, Variant, ProductRegistration, Product, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'finance', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '30d'; // 'today' | '7d' | '30d' | 'custom'

    const now = new Date();
    let durationMs = 30 * 86400000;
    if (range === 'today') durationMs = 1 * 86400000;
    if (range === '7d') durationMs = 7 * 86400000;

    const startDate = new Date(now.getTime() - durationMs);
    const prevStartDate = new Date(startDate.getTime() - durationMs);

    // Current period metrics
    const [
      salesAgg,
      totalOrders,
      prevSalesAgg,
      prevOrders,
      pendingPayments,
      lowStockRows,
      expiringWarranties,
      openClaims,
      statusBreakdown,
      categoryAgg,
      recentActivity,
      trendOrders
    ] = await Promise.all([
      // Current revenue & paid orders
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            paidCount: { $sum: 1 },
            uniqueCustomers: { $addToSet: '$phone' }
          }
        }
      ]),
      Order.countDocuments({ createdAt: { $gte: startDate } }),

      // Previous period revenue & paid orders (for comparison)
      Order.aggregate([
        { $match: { createdAt: { $gte: prevStartDate, $lt: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, paidCount: { $sum: 1 } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),

      // Pending payments
      Payment.countDocuments({ status: { $in: ['created', 'authorized'] } }),

      // Low stock variants
      Inventory.aggregate([
        { $match: { $expr: { $lte: ['$available', '$lowStockAt'] } } },
        { $group: { _id: '$variantId' } }
      ]),

      // Warranties expiring in next 30 days
      ProductRegistration.countDocuments({
        status: { $in: ['active', 'expiring_soon'] },
        expiryDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) }
      }),

      // Open claims
      WarrantyClaim.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),

      // Orders by status
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Category breakdown
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sku',
            revenue: { $sum: '$items.lineTotal' },
            units: { $sum: '$items.qty' },
            name: { $first: '$items.name' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 }
      ]),

      // Recent Activity Feed from AuditLog
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),

      // Trend data
      Order.find({ createdAt: { $gte: startDate }, paymentStatus: 'paid' })
        .select('createdAt total')
        .sort({ createdAt: 1 })
        .lean()
    ]);

    const curRevenue = salesAgg[0]?.revenue || 0;
    const curPaid = salesAgg[0]?.paidCount || 0;
    const curAov = curPaid > 0 ? Math.round(curRevenue / curPaid) : 0;
    const newCustomers = (salesAgg[0]?.uniqueCustomers || []).filter(Boolean).length;

    const prevRevenue = prevSalesAgg[0]?.revenue || 0;
    const revChangePercent = prevRevenue > 0 ? Math.round(((curRevenue - prevRevenue) / prevRevenue) * 100) : 0;
    const orderChangePercent = prevOrders > 0 ? Math.round(((totalOrders - prevOrders) / prevOrders) * 100) : 0;

    // Daily trend buckets
    const trendMap = new Map();
    trendOrders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      trendMap.set(day, (trendMap.get(day) || 0) + (o.total || 0));
    });
    const revenueTrend = Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    const ordersByStatus = {};
    statusBreakdown.forEach((s) => {
      if (s._id) ordersByStatus[s._id] = s.count;
    });

    return ok({
      range,
      kpis: {
        revenue: curRevenue,
        revenueChange: revChangePercent,
        orders: totalOrders,
        ordersChange: orderChangePercent,
        aov: curAov,
        newCustomers,
        pendingPayments,
        lowStockCount: lowStockRows.length,
        expiringWarranties,
        openClaims
      },
      revenueTrend,
      ordersByStatus,
      topProducts: categoryAgg.map((p) => ({
        sku: p._id,
        name: p.name,
        revenue: p.revenue,
        units: p.units
      })),
      recentActivity: recentActivity.map((a) => ({
        id: String(a._id),
        action: a.action,
        entity: a.entity || a.targetModel,
        actor: a.actorEmail || a.actor || 'operations',
        at: a.createdAt
      }))
    });
  } catch (error) {
    return apiError(error);
  }
}
