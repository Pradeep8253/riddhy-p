import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { Category, Product, AuditLog } from '@/models/index';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100).optional(),
  name_hi: z.string().optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  type: z.enum(['furniture', 'appliance', 'utensils']).optional(),
  room: z.string().optional(),
  image: z.string().optional(),
  imageKey: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  active: z.boolean().optional()
});

export async function GET(request, { params }) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing', 'warehouse']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    const { id } = await params;
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) {
      return fail('Category not found', 404);
    }

    const count = await Product.countDocuments({ category: category.slug });
    return ok({ ...category, id: String(category._id), productCount: count });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid update details', 400, parsed.error.flatten());
    }

    await connectDB();
    const category = await Category.findById(id);
    if (!category) {
      return fail('Category not found', 404);
    }

    // Check slug collision if slug is changing
    if (parsed.data.slug && parsed.data.slug !== category.slug) {
      const collision = await Category.findOne({ slug: parsed.data.slug, _id: { $ne: id } });
      if (collision) {
        return fail(`Slug "${parsed.data.slug}" is already in use by another category.`, 409);
      }
    }

    const oldSlug = category.slug;
    Object.assign(category, parsed.data);
    if (!category.imageKey && category.slug) {
      category.imageKey = category.slug;
    }
    await category.save();

    // If slug changed, update all products that were using oldSlug
    if (parsed.data.slug && parsed.data.slug !== oldSlug) {
      await Product.updateMany(
        { category: oldSlug },
        { $set: { category: parsed.data.slug, categoryLabel: category.name } }
      );
    }

    // Audit log
    await AuditLog.create({
      userId: auth.user?._id || auth.user?.id,
      action: 'category.update',
      resource: 'category',
      resourceId: String(category._id),
      metadata: { slug: category.slug, name: category.name, changes: parsed.data }
    }).catch(() => {});

    try {
      revalidateTag('catalogue', 'max');
    } catch {}

    return ok({ ...category.toObject(), id: String(category._id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request, ['super-admin', 'admin']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return fail('Category not found', 404);
    }

    // Soft delete: NEVER permanently delete from database!
    await Category.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date(), active: false } },
      { strict: false, new: true }
    );

    // Audit log
    await AuditLog.create({
      userId: auth.user?._id || auth.user?.id,
      action: 'category.delete',
      resource: 'category',
      resourceId: id,
      metadata: { slug: category.slug, name: category.name, softDelete: true }
    }).catch(() => {});

    try {
      revalidateTag('catalogue', 'max');
    } catch {}

    return ok({ message: 'Category removed successfully.', deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
