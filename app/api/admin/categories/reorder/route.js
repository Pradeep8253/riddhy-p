import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { Category, AuditLog } from '@/models/index';
import { z } from 'zod';

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.coerce.number().int(),
    })
  ).min(1),
});

export async function PUT(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid reorder payload', 400, parsed.error.flatten());
    }

    await connectDB();

    const bulkOps = parsed.data.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    // Audit log
    await AuditLog.create({
      userId: auth.user?._id || auth.user?.id,
      action: 'category.reorder',
      resource: 'category',
      metadata: { count: parsed.data.items.length },
    }).catch(() => {});

    try {
      revalidateTag('catalogue', 'max');
    } catch {}

    return ok({ success: true, message: 'Categories reordered successfully' });
  } catch (error) {
    return apiError(error);
  }
}

