import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { Product, AuditLog } from '@/models/index';
import { z } from 'zod';

const patchSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(['pin', 'unpin', 'hide', 'unhide', 'setTags']),
  tag: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export async function GET(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const tags = ['best-selling', 'popular', 'trending', 'new-arrival', 'deal', 'featured'];

    const rails = {};
    for (const tag of tags) {
      const items = await Product.find({
        status: 'active',
        tags: tag
      })
        .select('name slug sku brand category price mrp stock image gallery tags tagOverrides sales30d badgeText')
        .sort({ sales30d: -1, createdAt: -1 })
        .limit(20)
        .lean();

      rails[tag] = items.map((p) => ({
        ...p,
        id: String(p._id),
        isPinned: (p.tagOverrides?.pin || []).includes(tag),
        isExcluded: (p.tagOverrides?.hide || []).includes(tag)
      }));
    }

    return ok({ rails });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'marketing']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid request data', 400, parsed.error.format());
    }

    const { productId, action, tag, tags } = parsed.data;
    const product = await Product.findById(productId);
    if (!product) {
      return fail('Product not found', 404);
    }

    if (!product.tagOverrides) {
      product.tagOverrides = { pin: [], hide: [] };
    }

    const currentPins = new Set(product.tagOverrides.pin || []);
    const currentHides = new Set(product.tagOverrides.hide || []);
    const currentTags = new Set(product.tags || []);

    if (action === 'pin' && tag) {
      currentPins.add(tag);
      currentHides.delete(tag);
      currentTags.add(tag);
    } else if (action === 'unpin' && tag) {
      currentPins.delete(tag);
    } else if (action === 'hide' && tag) {
      currentHides.add(tag);
      currentPins.delete(tag);
      currentTags.delete(tag);
    } else if (action === 'unhide' && tag) {
      currentHides.delete(tag);
    } else if (action === 'setTags' && Array.isArray(tags)) {
      product.tags = tags;
    }

    product.tagOverrides.pin = Array.from(currentPins);
    product.tagOverrides.hide = Array.from(currentHides);
    product.tags = Array.from(currentTags);
    await product.save();

    revalidateTag('catalogue', 'max');

    await AuditLog.create({
      action: 'merchandising_override',
      actor: auth.userId || 'admin',
      targetModel: 'Product',
      targetId: product._id,
      metadata: { action, tag, tags }
    }).catch(() => null);

    return ok({
      success: true,
      product: {
        id: String(product._id),
        tags: product.tags,
        tagOverrides: product.tagOverrides
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
