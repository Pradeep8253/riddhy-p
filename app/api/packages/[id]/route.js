import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { MarriagePackage, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';
import { getLivePackageBySlug } from '@/lib/packages-data';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    let doc = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await MarriagePackage.findById(id).lean();
    }
    if (!doc) {
      doc = await getLivePackageBySlug(id);
    }
    if (!doc) return fail('Package not found.', 404);
    return ok(doc);
  } catch (err) {
    const fallback = await getLivePackageBySlug(id);
    if (fallback) return ok(fallback);
    return fail('Package not found.', 404);
  }
}

export async function PUT(request, { params }) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const { id } = await params;
  const body = await jsonBody(request);

  try {
    await connectDB();
    let existing = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      existing = await MarriagePackage.findById(id);
    }
    if (!existing) {
      existing = await MarriagePackage.findOne({ slug: id });
    }
    if (!existing) return fail('Package not found.', 404);

    const updated = await MarriagePackage.findByIdAndUpdate(
      existing._id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UPDATE_MARRIAGE_PACKAGE',
      entity: 'MarriagePackage',
      entityId: String(existing._id),
      before: existing.toObject(),
      after: body
    }).catch(() => {});

    return ok(updated);
  } catch (error) {
    return fail(`Could not update package: ${error.message}`, 500);
  }
}

export async function DELETE(request, { params }) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Admin permission required.', 403);

  const { id } = await params;

  try {
    await connectDB();
    let query = {};
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }
    const deleted = await MarriagePackage.findOneAndDelete(query).lean();
    if (!deleted) return fail('Package not found.', 404);

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'DELETE_MARRIAGE_PACKAGE',
      entity: 'MarriagePackage',
      entityId: String(deleted._id),
      before: deleted
    }).catch(() => {});

    return ok({ message: 'Package deleted successfully.' });
  } catch (error) {
    return fail(`Could not delete package: ${error.message}`, 500);
  }
}
