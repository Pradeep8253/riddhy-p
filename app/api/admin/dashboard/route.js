import { connectDB } from '@/lib/db';
import {
  Order,
  Payment,
  WarrantyClaim,
  Inventory,
  ProductRegistration,
  AuditLog,
  Variant
} from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const actor = await requireAdmin(
    new Set(['admin', 'super-admin', 'finance', 'marketing', 'support', 'warehouse'])
  );
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '30d'; // 'today' | '7d' | '30d' | 'custom'
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');

    const now = new Date();
    let startDate;
    let endDate = now;
    let durationMs;

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      durationMs = 86400000;
    } else if (range === '7d') {
      durationMs = 7 * 86400000;
      startDate = new Date(now.getTime() - durationMs);
    } else if (range === 'custom') {
      if (!fromParam) {
        return fail('Start date is required for custom date range.', 400);
      }
      startDate = new Date(fromParam);
      endDate = toParam ? new Date(toParam) : now;
      if (isNaN(startDate.getTime())) {
        return fail('Invalid start date provided.', 400);
      }
      if (isNaN(endDate.getTime())) {
        return fail('Invalid end date provided.', 400);
      }
      if (startDate > endDate) {
        return fail('Start date cannot be after end date.', 400);
      }
      // If end date is YYYY-MM-DD, set to 23:59:59.999 to cover full day
      if (toParam && toParam.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }
      durationMs = Math.max(86400000, endDate.getTime() - startDate.getTime());
    } else {
      // Default 30d
      durationMs = 30 * 86400000;
      startDate = new Date(now.getTime() - durationMs);
    }

    const prevStartDate = new Date(startDate.getTime() - durationMs);
    const prevEndDate = new Date(startDate.getTime());

    // Execute comprehensive aggregations in parallel
    const [
      currentOrdersAgg,
      prevOrdersAgg,
      pendingPaymentsOrders,
      paymentMethodAgg,
      codPendingAgg,
      failedPaymentsCount,
      lowStockDocs,
      expiringWarrantiesCount,
      openClaimsCount,
      ordersByStatusAgg,
      topProductsAgg,
      categoryAgg,
      geoAgg,
      recentOrders,
      recentActivityDocs,
      dailyTrendOrders
    ] = await Promise.all([
      // 1. Current period orders overview (paid, unpaid, refunded, taxes)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
            },
            grossRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] }
            },
            refundedAmount: { $sum: { $ifNull: ['$refundedAmount', 0] } },
            totalTax: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, { $ifNull: ['$tax', 0] }, 0] }
            },
            pendingAmount: {
              $sum: {
                $cond: [
                  { $in: ['$paymentStatus', ['unpaid', 'pending']] },
                  { $ifNull: ['$total', 0] },
                  0
                ]
              }
            },
            customers: { $addToSet: '$phone' }
          }
        }
      ]),

      // 2. Previous period orders overview (for comparison % change)
      Order.aggregate([
        { $match: { createdAt: { $gte: prevStartDate, $lt: prevEndDate } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            grossRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] }
            },
            refundedAmount: { $sum: { $ifNull: ['$refundedAmount', 0] } }
          }
        }
      ]),

      // 3. Top Pending / Outstanding Orders (Top 10)
      Order.find({
        paymentStatus: { $in: ['unpaid', 'pending'] }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber phone shippingAddress billingAddress total refundedAmount paymentMethod paymentStatus status createdAt')
        .lean(),

      // 4. Payment method distribution for the period
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $ifNull: ['$paymentMethod', 'razorpay'] },
            count: { $sum: 1 },
            amount: { $sum: '$total' }
          }
        }
      ]),

      // 5. COD pending to collect (COD orders not delivered/collected)
      Order.aggregate([
        {
          $match: {
            paymentMethod: 'cod',
            codCollectedAt: { $exists: false },
            status: { $nin: ['delivered', 'installed', 'completed', 'cancelled'] }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: '$total' }
          }
        }
      ]),

      // 6. Failed or abandoned payment count
      Payment.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'failed'
      }),

      // 7. Low Stock Inventory count and top 6 items
      Inventory.aggregate([
        { $match: { $expr: { $lte: ['$available', '$lowStockAt'] } } },
        {
          $lookup: {
            from: 'variants',
            localField: 'variantId',
            foreignField: '_id',
            as: 'variant'
          }
        },
        { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'products',
            localField: 'variant.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $sort: { available: 1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 1,
            available: 1,
            lowStockAt: 1,
            sku: { $ifNull: ['$variant.sku', 'SKU-UNKNOWN'] },
            name: { $ifNull: ['$product.name', 'Catalogue Piece'] }
          }
        }
      ]),

      // 8. Warranties expiring in next 30 days
      ProductRegistration.countDocuments({
        status: { $in: ['active', 'expiring_soon'] },
        expiryDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) }
      }),

      // 9. Open Warranty Claims
      WarrantyClaim.countDocuments({
        status: { $in: ['submitted', 'under_review', 'action_scheduled'] }
      }),

      // 10. Orders by status (pipeline funnel)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 11. Top 5 selling products by revenue and units
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sku',
            name: { $first: '$items.name' },
            revenue: { $sum: { $ifNull: ['$items.lineTotal', { $multiply: ['$items.unitPrice', '$items.qty'] }] } },
            units: { $sum: '$items.qty' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),

      // 12. Sales by Category
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: { $ifNull: ['$items.variant.category', 'Furniture & Appliances'] },
            revenue: { $sum: { $ifNull: ['$items.lineTotal', { $multiply: ['$items.unitPrice', '$items.qty'] }] } },
            units: { $sum: '$items.qty' }
          }
        },
        { $sort: { revenue: -1 } }
      ]),

      // 13. Revenue by City / State
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: {
              state: { $ifNull: ['$shippingAddress.state', 'Uttar Pradesh'] },
              city: { $ifNull: ['$shippingAddress.city', 'Prayagraj'] }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 }
      ]),

      // 14. Recent Orders (last 8)
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber phone total status paymentStatus paymentMethod items createdAt')
        .lean(),

      // 15. Recent Audit Activity
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 16. Orders for Daily Trend (received vs pending)
      Order.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .select('createdAt total paymentStatus')
        .sort({ createdAt: 1 })
        .lean()
    ]);

    // Compute Primary KPIs
    const curStats = currentOrdersAgg[0] || {};
    const prevStats = prevOrdersAgg[0] || {};

    const grossRevenue = curStats.grossRevenue || 0;
    const refundedAmount = curStats.refundedAmount || 0;
    const netRevenue = Math.max(0, grossRevenue - refundedAmount);
    const paidOrders = curStats.paidOrders || 0;
    const totalOrders = curStats.totalOrders || 0;
    const aov = paidOrders > 0 ? Math.round(netRevenue / paidOrders) : (totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0);
    const uniqueCustomers = (curStats.customers || []).filter(Boolean).length;

    const prevGross = prevStats.grossRevenue || 0;
    const prevRefunded = prevStats.refundedAmount || 0;
    const prevNetRevenue = Math.max(0, prevGross - prevRefunded);
    const prevTotalOrders = prevStats.totalOrders || 0;

    const revenueChange =
      prevNetRevenue > 0
        ? Math.round(((netRevenue - prevNetRevenue) / prevNetRevenue) * 100)
        : 0;
    const ordersChange =
      prevTotalOrders > 0
        ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100)
        : 0;

    const paymentReceived = grossRevenue;
    const paymentPending = curStats.pendingAmount || 0;
    const totalTax = curStats.totalTax || 0;

    // GST split (assuming standard intrastate 50-50 CGST/SGST, interstate IGST)
    const cgst = Math.round(totalTax * 0.45);
    const sgst = Math.round(totalTax * 0.45);
    const igst = Math.max(0, totalTax - cgst - sgst);

    // Payments Donut & Breakdown
    const totalPaymentVolume = paymentReceived + paymentPending + refundedAmount;
    const paymentBreakdown = {
      received: {
        amount: paymentReceived,
        pct: totalPaymentVolume > 0 ? Math.round((paymentReceived / totalPaymentVolume) * 100) : 0
      },
      pending: {
        amount: paymentPending,
        pct: totalPaymentVolume > 0 ? Math.round((paymentPending / totalPaymentVolume) * 100) : 0
      },
      refunded: {
        amount: refundedAmount,
        pct: totalPaymentVolume > 0 ? Math.round((refundedAmount / totalPaymentVolume) * 100) : 0
      }
    };

    // Format Pending Payments List
    const pendingPaymentsFormatted = pendingPaymentsOrders.map((o) => {
      const createdDate = new Date(o.createdAt);
      const ageInDays = Math.max(0, Math.floor((now.getTime() - createdDate.getTime()) / 86400000));
      const customerName = o.billingAddress?.name || o.shippingAddress?.name || o.phone || 'Customer';
      const paid = o.paymentStatus === 'paid' ? o.total : 0;
      const balance = Math.max(0, (o.total || 0) - paid);

      return {
        id: String(o._id),
        orderNumber: o.orderNumber,
        customer: customerName,
        phone: o.phone || '',
        total: o.total || 0,
        paid,
        balance,
        ageInDays,
        paymentMethod: o.paymentMethod || 'razorpay',
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt
      };
    });

    // Payment Methods Formatting
    const paymentMethodsFormatted = paymentMethodAgg.map((pm) => ({
      method: pm._id,
      label:
        pm._id === 'razorpay'
          ? 'UPI / Cards / NetBanking'
          : pm._id === 'cod'
          ? 'Cash on Delivery (COD)'
          : 'Bank Transfer / Offline',
      count: pm.count,
      amount: pm.amount
    }));

    // COD stats
    const codStats = {
      pendingCount: codPendingAgg[0]?.count || 0,
      pendingAmount: codPendingAgg[0]?.amount || 0
    };

    // Daily Trend Buckets (Received vs Pending)
    const trendMap = new Map();
    dailyTrendOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const current = trendMap.get(key) || { date: key, received: 0, pending: 0, total: 0 };
      if (o.paymentStatus === 'paid') {
        current.received += o.total || 0;
      } else {
        current.pending += o.total || 0;
      }
      current.total += o.total || 0;
      trendMap.set(key, current);
    });
    const dailyTrend = Array.from(trendMap.values());

    // Pipeline funnel
    const statusMap = {};
    ordersByStatusAgg.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    const pipeline = {
      placed: (statusMap['draft_cart'] || 0) + (statusMap['payment_pending'] || 0) + (statusMap['paid'] || 0),
      confirmed: (statusMap['confirmed'] || 0) + (statusMap['processing'] || 0) + (statusMap['packed'] || 0),
      shipped: (statusMap['ready_for_dispatch'] || 0) + (statusMap['shipped'] || 0) + (statusMap['out_for_delivery'] || 0),
      delivered: (statusMap['delivered'] || 0) + (statusMap['installation_scheduled'] || 0) + (statusMap['installed'] || 0) + (statusMap['completed'] || 0),
      returned: (statusMap['return_requested'] || 0) + (statusMap['returned'] || 0) + (statusMap['refunded'] || 0)
    };

    // Customer types: new vs returning
    const returningCustomers = Math.max(0, uniqueCustomers - Math.min(uniqueCustomers, totalOrders));
    const newCustomersCount = Math.max(0, uniqueCustomers - returningCustomers);

    // Monthly GST summary (current month + past 2 months)
    const monthlyGst = [
      {
        month: now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        taxable: Math.round(grossRevenue / 1.18),
        cgst,
        sgst,
        igst,
        totalTax
      }
    ];

    // Geo Revenue
    const geoRevenue = geoAgg.map((g) => ({
      state: g._id.state,
      city: g._id.city,
      revenue: g.revenue,
      orders: g.orders
    }));

    // Categories
    const salesByCategory = categoryAgg.map((c) => ({
      category: c._id,
      revenue: c.revenue,
      units: c.units
    }));

    // Top Products
    const topProducts = topProductsAgg.map((p) => ({
      sku: p._id,
      name: p.name,
      revenue: p.revenue,
      units: p.units
    }));

    return ok({
      range,
      startDate,
      endDate,
      kpis: {
        netRevenue,
        revenueChange,
        totalOrders,
        ordersChange,
        aov,
        uniqueCustomers,
        paymentReceived,
        paymentPending,
        failedPaymentsCount,
        refundsIssued: refundedAmount,
        gstCollected: totalTax,
        gstSplit: { cgst, sgst, igst },
        lowStockCount: lowStockDocs.length,
        expiringWarranties: expiringWarrantiesCount,
        openClaims: openClaimsCount
      },
      payments: {
        breakdown: paymentBreakdown,
        pendingPayments: pendingPaymentsFormatted,
        methods: paymentMethodsFormatted,
        cod: codStats
      },
      charts: {
        dailyTrend,
        pipeline,
        topProducts,
        salesByCategory,
        geoRevenue,
        customerTypes: {
          new: newCustomersCount,
          returning: returningCustomers
        },
        monthlyGst
      },
      widgets: {
        recentOrders: recentOrders.map((o) => ({
          id: String(o._id),
          orderNumber: o.orderNumber,
          phone: o.phone,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          itemsCount: (o.items || []).length,
          createdAt: o.createdAt
        })),
        recentActivity: recentActivityDocs.map((a) => ({
          id: String(a._id),
          action: a.action,
          entity: a.entity || 'Record',
          actor: a.actorEmail || 'Operations',
          at: a.createdAt
        })),
        lowStockItems: lowStockDocs
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
