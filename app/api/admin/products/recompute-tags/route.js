import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { Product, Order, AuditLog } from '@/models/index';

export async function POST(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Calculate sales in the last 30 days from real orders
    const validOrderStatuses = [
      'paid',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'completed'
    ];

    const sales30dAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: validOrderStatuses },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      }
    ]);

    const salesMap = new Map();
    for (const row of sales30dAgg) {
      if (row._id) salesMap.set(String(row._id), row.unitsSold);
    }

    // 2. Fetch all active products
    const products = await Product.find({ status: { $ne: 'archived' } });
    if (!products.length) {
      return ok({ message: 'No active products to recompute', updated: 0 });
    }

    // Update sales30d on all products
    const bulkUpdates = [];
    for (const p of products) {
      const pIdStr = String(p._id);
      const units = salesMap.get(pIdStr) || 0;
      p.sales30d = units;
    }

    // Sort products for computed tags
    // A) Best Selling: top 20% or top products with sales > 0
    const sortedBySales = [...products].sort((a, b) => (b.sales30d || 0) - (a.sales30d || 0));
    const bestSellingIds = new Set(
      sortedBySales.slice(0, 15).filter((p) => (p.sales30d || 0) > 0).map((p) => String(p._id))
    );

    // B) Popular: weighted score (views30d + wishlistCount * 4 + sales30d * 6)
    const sortedByPopularity = [...products].sort((a, b) => {
      const scoreA = (a.views30d || 0) + (a.wishlistCount || 0) * 4 + (a.sales30d || 0) * 6;
      const scoreB = (b.views30d || 0) + (b.wishlistCount || 0) * 4 + (b.sales30d || 0) * 6;
      return scoreB - scoreA;
    });
    const popularIds = new Set(sortedByPopularity.slice(0, 15).map((p) => String(p._id)));

    // C) New Arrival: created within 30 days
    const newArrivalIds = new Set(
      products
        .filter((p) => p.createdAt >= thirtyDaysAgo && p.status === 'active')
        .map((p) => String(p._id))
    );

    // Apply tags with override rules
    let updatedCount = 0;
    const tagSummary = {
      bestSelling: 0,
      popular: 0,
      trending: 0,
      newArrival: 0
    };

    for (const p of products) {
      const pIdStr = String(p._id);
      const pins = new Set(p.tagOverrides?.pin || []);
      const hides = new Set(p.tagOverrides?.hide || []);
      const computed = new Set();

      if (bestSellingIds.has(pIdStr)) computed.add('best-selling');
      if (popularIds.has(pIdStr)) computed.add('popular');
      if (newArrivalIds.has(pIdStr)) computed.add('new-arrival');

      // If sales velocity or high views, add trending
      if (computed.has('popular') && (p.sales30d || 0) > 2) {
        computed.add('trending');
      }

      // Merge: Pin overrides win, hide overrides excluded
      for (const pin of pins) {
        computed.add(pin);
      }
      for (const hide of hides) {
        computed.delete(hide);
      }

      // Retain existing special tags like 'deal', 'featured', 'limited' if previously present
      const manualTags = (p.tags || []).filter((t) => ['deal', 'featured', 'limited'].includes(t));
      for (const mt of manualTags) {
        if (!hides.has(mt)) computed.add(mt);
      }

      // Ensure every product always has at least 1-2 relevant tags
      if (computed.size === 0) {
        if ((p.discount || 0) >= 15) {
          computed.add('deal');
          computed.add('popular');
        } else if ((p.price || 0) >= 40000) {
          computed.add('featured');
          computed.add('best-selling');
        } else {
          computed.add('popular');
          computed.add('trending');
        }
      }

      const finalTags = Array.from(computed);
      p.tags = finalTags;

      if (finalTags.includes('best-selling')) tagSummary.bestSelling++;
      if (finalTags.includes('popular')) tagSummary.popular++;
      if (finalTags.includes('trending')) tagSummary.trending++;
      if (finalTags.includes('new-arrival')) tagSummary.newArrival++;

      // Set badge text if empty
      if (!p.badgeText || ['Best Seller', 'Popular', 'New', 'Trending', 'Deal'].includes(p.badgeText)) {
        if (finalTags.includes('best-selling')) p.badgeText = 'Best Seller';
        else if (finalTags.includes('trending')) p.badgeText = 'Trending';
        else if (finalTags.includes('popular')) p.badgeText = 'Popular';
        else if (finalTags.includes('new-arrival')) p.badgeText = 'New Arrival';
        else if (finalTags.includes('deal')) p.badgeText = 'Deal';
      }

      await p.save();
      updatedCount++;
    }

    // Revalidate Next.js cache
    revalidateTag('catalogue', 'max');

    // Audit log
    await AuditLog.create({
      action: 'recompute_tags',
      actor: auth.userId || 'admin',
      targetModel: 'Product',
      metadata: { updatedCount, tagSummary }
    }).catch(() => null);

    return ok({
      success: true,
      message: `Recomputed tags for ${updatedCount} products.`,
      updatedCount,
      summary: tagSummary
    });
  } catch (error) {
    return apiError(error);
  }
}
