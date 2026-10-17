import { connectDB } from '@/lib/db';
import { ProductRegistration, WarrantyClaim, AuditLog, ClaimEvent } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { computeWarrantyStatus, daysRemaining } from '@/lib/warranty';

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim();
    const status = url.searchParams.get('status');
    const tab = url.searchParams.get('tab') || 'registrations'; // 'registrations' | 'review_queue' | 'claims'
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') || 25)));

    if (tab === 'claims') {
      const claimFilter = {};
      if (status && status !== 'all') claimFilter.status = status;
      if (search) {
        claimFilter.$or = [
          { claimNumber: { $regex: search, $options: 'i' } },
          { issue: { $regex: search, $options: 'i' } },
          { preferredContact: { $regex: search, $options: 'i' } }
        ];
      }

      const [claims, totalClaims] = await Promise.all([
        WarrantyClaim.find(claimFilter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        WarrantyClaim.countDocuments(claimFilter)
      ]);

      return ok({
        claims: claims.map((c) => ({ ...c, id: String(c._id) })),
        total: totalClaims,
        page,
        limit
      });
    }

    // Registrations & Review Queue
    const regQuery = {};
    if (tab === 'review_queue') {
      regQuery.verified = false;
    } else if (status && status !== 'all') {
      regQuery.status = status;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regQuery.$or = [
        { customerName: { $regex: escaped, $options: 'i' } },
        { customerPhone: { $regex: escaped, $options: 'i' } },
        { serialNumber: { $regex: escaped, $options: 'i' } },
        { orderNumber: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } },
        { productName: { $regex: escaped, $options: 'i' } }
      ];
    }

    const [registrations, totalRegs] = await Promise.all([
      ProductRegistration.find(regQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProductRegistration.countDocuments(regQuery)
    ]);

    const enrichedRegs = registrations.map((r) => {
      const remaining = daysRemaining(r.expiryDate);
      return {
        ...r,
        id: String(r._id),
        remainingDays: remaining,
        currentStatus: computeWarrantyStatus(r.expiryDate)
      };
    });

    return ok({
      registrations: enrichedRegs,
      total: totalRegs,
      page,
      limit
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    const body = await request.json();
    const { id, type, status, action, adminNotes, assignedToEmail, slaDeadline } = body;
    if (!id) return fail('Record ID is required.', 400);

    await connectDB();

    if (type === 'claim') {
      const updateFields = {};
      if (status) updateFields.status = status;
      if (adminNotes) updateFields.resolutionNotes = adminNotes;
      if (assignedToEmail) updateFields.assignedToEmail = assignedToEmail;
      if (slaDeadline) updateFields.slaDeadline = new Date(slaDeadline);
      if (status === 'resolved') updateFields.resolvedAt = new Date();

      const updated = await WarrantyClaim.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      ).lean();

      // Log claim event
      await ClaimEvent.create({
        claimId: id,
        status: status || updated.status,
        note: adminNotes || `Claim updated by ${actor.email}`,
        actorId: actor.sub
      }).catch(() => null);

      return ok(updated);
    }

    // Product Registration action (Approve, Reject, or status update)
    const reg = await ProductRegistration.findById(id);
    if (!reg) return fail('Registration not found', 404);

    if (action === 'approve') {
      reg.verified = true;
      reg.status = computeWarrantyStatus(reg.expiryDate);
      reg.adminNotes = adminNotes || 'Approved by operations desk.';
    } else if (action === 'reject') {
      reg.verified = false;
      reg.status = 'rejected';
      reg.adminNotes = adminNotes || 'Proof of purchase invalid / rejected.';
    } else {
      if (status) reg.status = status;
      if (adminNotes) reg.adminNotes = adminNotes;
    }

    await reg.save();

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: `warranty_registration.${action || 'update'}`,
      entity: 'ProductRegistration',
      entityId: id,
      after: { status: reg.status, verified: reg.verified, adminNotes: reg.adminNotes }
    }).catch(() => null);

    return ok(reg.toObject());
  } catch (error) {
    return apiError(error);
  }
}
