import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Product, Variant, Inventory, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail } from '@/lib/http';
import { revalidateTag } from 'next/cache';

export async function GET(request, { params }) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing', 'warehouse', 'finance']));
  if (!actor) return fail('Admin permission required.', 403);

  const { id } = await params;
  if (!id) return fail('Product ID is required.', 400);

  try {
    await connectDB();
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const product = await Product.findOne(query).lean();
    if (!product) return fail('Product not found.', 404);

    const variants = await Variant.find({ productId: product._id }).lean();
    const primaryVariant = variants[0];
    let inventory = null;
    if (primaryVariant) {
      inventory = await Inventory.findOne({ variantId: primaryVariant._id }).lean();
    }

    const auditLogs = await AuditLog.find({ entity: 'Product', entityId: String(product._id) })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return ok({
      ...product,
      id: String(product._id),
      sku: primaryVariant?.sku || '',
      price: primaryVariant?.price ?? product.price,
      mrp: primaryVariant?.mrp ?? product.mrp,
      stock: inventory?.available ?? primaryVariant?.stock ?? 0,
      reserved: inventory?.reserved ?? 0,
      variants,
      auditLogs
    });
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Admin permission required.', 403);

  const { id } = await params;
  if (!id) return fail('Product ID is required.', 400);

  try {
    await connectDB();
    const product = await Product.findById(id);
    if (!product) return fail('Product not found.', 404);

    // Soft delete: never hard delete from database!
    await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date(), status: 'archived', archivedAt: new Date() } },
      { strict: false, new: true }
    );

    await Variant.updateMany({ productId: product._id }, { $set: { active: false } });

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'product.archive',
      entity: 'Product',
      entityId: String(product._id),
      after: { status: 'archived', name: product.name }
    });

    revalidateTag('catalogue', 'max');
    return ok({ message: 'Product deleted successfully.', id: String(product._id), deleted: true });
  } catch (error) {
    return fail(error.message, 500);
  }
}
