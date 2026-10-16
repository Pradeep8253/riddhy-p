import { connectDB } from '@/lib/db';
import { ProductRegistration, WarrantyClaim, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    if (!process.env.MONGODB_URI) {
      return ok({
        registrations: [],
        claims: [],
        isDemo: true
      });
    }

    await connectDB();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim();
    const status = url.searchParams.get('status');

    const regQuery = {};
    if (status && status !== 'all') {
      regQuery.status = status;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regQuery.$or = [
        { customerName: { $regex: escaped, $options: 'i' } },
        { customerPhone: { $regex: escaped, $options: 'i' } },
        { serialNumber: { $regex: escaped, $options: 'i' } },
        { orderNumber: { $regex: escaped, $options: 'i' } },
        { productName: { $regex: escaped, $options: 'i' } }
      ];
    }

    const registrations = await ProductRegistration.find(regQuery).sort({ createdAt: -1 }).limit(100).lean();
    const claims = await WarrantyClaim.find({}).sort({ createdAt: -1 }).limit(50).lean();

    const now = Date.now();
    const enrichedRegs = registrations.map((r) => {
      const exp = new Date(r.expiryDate);
      const remainingDays = Math.max(0, Math.ceil((exp.getTime() - now) / 86400000));
      return {
        ...r,
        id: String(r._id),
        remainingDays,
        currentStatus: remainingDays <= 0 ? 'expired' : remainingDays <= 30 ? 'expiring_soon' : 'active'
      };
    });

    return ok({
      registrations: enrichedRegs,
      claims: claims.map((c) => ({ ...c, id: String(c._id) }))
    });
  } catch (error) {
    return fail(`Could not load warranty records: ${error.message}`, 500);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support']));
  if (!actor) return fail('Admin permission required.', 403);

  const body = await jsonBody(request);
  const { id, type, status, adminNotes } = body;

  if (!id) return fail('Record ID is required.', 400);

  try {
    await connectDB();
    if (type === 'claim') {
      const updated = await WarrantyClaim.findByIdAndUpdate(
        id,
        { $set: { status, adminNotes } },
        { new: true }
      ).lean();
      return ok(updated);
    }

    const updated = await ProductRegistration.findByIdAndUpdate(
      id,
      { $set: { status, adminNotes } },
      { new: true }
    ).lean();

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UPDATE_WARRANTY_REGISTRATION',
      entity: 'ProductRegistration',
      entityId: id,
      after: { status, adminNotes }
    }).catch(() => {});

    return ok(updated);
  } catch (error) {
    return fail(`Could not update record: ${error.message}`, 500);
  }
}
