import { connectDB } from '@/lib/db';
import { Invoice } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';

export async function GET(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'finance']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);

    const q = (url.searchParams.get('q') || '').trim();
    const financialYear = url.searchParams.get('financialYear');
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') || 25)));

    const filter = {};
    if (q) {
      filter.$or = [
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'buyer.name': { $regex: q, $options: 'i' } },
        { 'buyer.gstin': { $regex: q, $options: 'i' } }
      ];
    }

    if (financialYear && financialYear !== 'all') {
      filter.financialYear = financialYear;
    }

    const [invoices, total, totalsAgg] = await Promise.all([
      Invoice.find(filter)
        .sort({ invoiceDate: -1, sequenceNumber: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
      Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            taxableTotal: { $sum: '$taxableAmount' },
            cgstTotal: { $sum: '$cgstTotal' },
            sgstTotal: { $sum: '$sgstTotal' },
            igstTotal: { $sum: '$igstTotal' },
            grandTotal: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    const summary = totalsAgg[0] || {
      taxableTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      grandTotal: 0
    };

    return ok(
      invoices.map((inv) => ({
        ...inv,
        id: String(inv._id),
        _id: undefined
      })),
      200,
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        summary
      }
    );
  } catch (error) {
    return apiError(error);
  }
}
