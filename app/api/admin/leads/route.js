import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Lead, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['new', 'in_progress', 'scheduled', 'completed', 'no_show', 'resolved', 'spam']).optional(),
  assignedTo: z.string().optional(),
  scheduledAt: z.string().optional(),
  note: z.string().max(2000).optional()
});

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const kind = url.searchParams.get('kind');
    const serviceable = url.searchParams.get('serviceable');
    const search = url.searchParams.get('search')?.trim();
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const format = url.searchParams.get('format');

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (kind && kind !== 'all') {
      query.kind = kind;
    }
    if (serviceable === 'true') {
      query.serviceable = true;
    } else if (serviceable === 'false') {
      query.serviceable = false;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { reference: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(300).lean();

    // CSV Export option
    if (format === 'csv') {
      const headers = [
        'Reference',
        'Kind',
        'Status',
        'Name',
        'Phone',
        'Email',
        'Pincode',
        'Serviceable',
        'Topic/Mode',
        'Slot Date',
        'Slot Window',
        'Interests',
        'Budget',
        'Created At'
      ];

      const csvRows = [headers.join(',')];
      for (const lead of leads) {
        const row = [
          `"${lead.reference || ''}"`,
          `"${lead.kind || ''}"`,
          `"${lead.status || ''}"`,
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${lead.phone || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.pincode || ''}"`,
          `"${lead.serviceable ? 'Yes' : 'No'}"`,
          `"${lead.mode || lead.topic || ''}"`,
          `"${lead.preferredDate ? new Date(lead.preferredDate).toISOString().split('T')[0] : ''}"`,
          `"${lead.timeWindow || ''}"`,
          `"${(lead.interest || []).join('; ')}"`,
          `"${lead.budgetRange || ''}"`,
          `"${new Date(lead.createdAt).toISOString()}"`
        ];
        csvRows.push(row.join(','));
      }

      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    return ok(leads.map((lead) => ({
      ...lead,
      id: String(lead._id),
      _id: undefined
    })));
  } catch (error) {
    console.error('[Admin Leads Error]', error);
    return fail('Unable to load enquiries.', 500);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const parsed = updateSchema.safeParse(await jsonBody(request));
  if (!parsed.success) {
    return fail('Enquiry update data is invalid.', 400, parsed.error.flatten());
  }

  const { id, status, assignedTo, scheduledAt, note } = parsed.data;

  try {
    await connectDB();
    const updateOps = {};
    const setFields = {};

    if (status) setFields.status = status;
    if (assignedTo !== undefined) setFields.assignedTo = assignedTo || null;
    if (scheduledAt !== undefined) setFields.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    if (Object.keys(setFields).length > 0) {
      updateOps.$set = setFields;
    }

    if (note && note.trim().length > 0) {
      updateOps.$push = {
        internalNotes: {
          byName: actor.email || 'Admin',
          at: new Date(),
          text: note.trim()
        }
      };
    }

    const lead = await Lead.findByIdAndUpdate(id, updateOps, { new: true });
    if (!lead) return fail('Enquiry not found.', 404);

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'lead.update',
      entity: 'Lead',
      entityId: String(lead._id),
      after: {
        status: lead.status,
        assignedTo: lead.assignedTo,
        scheduledAt: lead.scheduledAt,
        notesCount: lead.internalNotes?.length || 0
      }
    });

    return ok({
      id: String(lead._id),
      status: lead.status,
      assignedTo: lead.assignedTo,
      scheduledAt: lead.scheduledAt,
      internalNotes: lead.internalNotes || []
    });
  } catch (error) {
    return fail(error.message, 400);
  }
}
