import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { Category, Product, AuditLog } from '@/models/index';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  name_hi: z.string().optional().default(''),
  slug: z.string().min(2, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  type: z.enum(['furniture', 'appliance']),
  room: z.string().optional().default(''),
  image: z.string().optional().default(''),
  imageKey: z.string().optional().default(''),
  sortOrder: z.coerce.number().optional().default(0),
  active: z.boolean().optional().default(true)
});

export async function GET(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing', 'warehouse']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();

    // Aggregate product counts per category slug
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countsMap = new Map(productCounts.map((row) => [row._id, row.count]));

    const enriched = categories.map((cat) => ({
      ...cat,
      id: String(cat._id),
      productCount: countsMap.get(cat.slug) || 0
    }));

    return ok(enriched);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid category details', 400, parsed.error.flatten());
    }

    await connectDB();

    // Check slug collision
    const existing = await Category.findOne({ slug: parsed.data.slug });
    if (existing) {
      return fail(`A category with slug "${parsed.data.slug}" already exists.`, 409);
    }

    const newCategory = await Category.create({
      ...parsed.data,
      imageKey: parsed.data.imageKey || parsed.data.slug
    });

    // Audit log
    await AuditLog.create({
      userId: auth.user?._id || auth.user?.id,
      action: 'category.create',
      resource: 'category',
      resourceId: String(newCategory._id),
      metadata: { slug: newCategory.slug, name: newCategory.name, type: newCategory.type }
    }).catch(() => {});

    try {
      revalidateTag('catalogue', 'max');
    } catch {}

    return ok({ ...newCategory.toObject(), id: String(newCategory._id) }, 201);
  } catch (error) {
    return apiError(error);
  }
}
