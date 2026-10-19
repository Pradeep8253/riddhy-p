import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Role, AdminUser } from '@/models/index';
import { requirePermission, invalidateRoleCache } from '@/lib/roles';
import { ok, fail, jsonBody, apiError } from '@/lib/http';
import { ALL_PERMISSIONS } from '@/lib/permissions';

const updateRoleSchema = z.object({
  label: z.string().min(2).max(64).optional(),
  description: z.string().max(256).optional(),
  permissions: z.array(z.string()).optional()
});

export async function GET(request, { params }) {
  const actor = await requirePermission('roles.manage');
  if (!actor) return fail('Permission denied. Requires roles.manage privileges.', 403);

  const { key } = await params;

  try {
    await connectDB();
    const role = await Role.findOne({ $or: [{ key }, { name: key }] }).lean();
    if (!role) return fail(`Role "${key}" not found.`, 404);

    const userCount = await AdminUser.countDocuments({ role: role.key || role.name });

    return ok({
      id: String(role._id),
      key: role.key || role.name,
      label: role.label || role.key,
      description: role.description || '',
      permissions: (role.key || role.name) === 'super-admin' ? [...ALL_PERMISSIONS] : (Array.isArray(role.permissions) ? role.permissions : []),
      isSystem: Boolean(role.isSystem ?? role.system),
      userCount,
      updatedAt: role.updatedAt
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  const actor = await requirePermission('roles.manage');
  if (!actor) return fail('Permission denied. Requires roles.manage privileges.', 403);

  const { key } = await params;

  if (key === 'super-admin') {
    return fail('Super Admin permissions are immutable and cannot be modified.', 403);
  }

  const body = await jsonBody(request);
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message || 'Invalid update payload.', 400);
  }

  try {
    await connectDB();
    const role = await Role.findOne({ $or: [{ key }, { name: key }] });
    if (!role) return fail(`Role "${key}" not found.`, 404);

    if (parsed.data.label) {
      role.label = parsed.data.label.trim();
    }
    if (parsed.data.description !== undefined) {
      role.description = parsed.data.description.trim();
    }
    if (Array.isArray(parsed.data.permissions)) {
      // Filter against valid permissions
      role.permissions = parsed.data.permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    }

    role.updatedBy = actor.sub;
    role.updatedByEmail = actor.email || '';
    await role.save();

    invalidateRoleCache();

    return ok({
      id: String(role._id),
      key: role.key || role.name,
      label: role.label,
      description: role.description,
      permissions: role.permissions,
      isSystem: Boolean(role.isSystem ?? role.system),
      updatedAt: role.updatedAt
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const actor = await requirePermission('roles.manage');
  if (!actor) return fail('Permission denied. Requires roles.manage privileges.', 403);

  const { key } = await params;

  const reservedSystem = ['super-admin', 'admin', 'finance', 'warehouse', 'marketing', 'support'];
  if (reservedSystem.includes(key)) {
    return fail(`System role "${key}" is protected and cannot be deleted.`, 403);
  }

  try {
    await connectDB();
    const role = await Role.findOne({ $or: [{ key }, { name: key }] });
    if (!role) return fail(`Role "${key}" not found.`, 404);

    if (role.isSystem || role.system) {
      return fail('System roles cannot be deleted.', 403);
    }

    const assignedCount = await AdminUser.countDocuments({ role: role.key || role.name });
    if (assignedCount > 0) {
      return fail(
        `Cannot delete role "${role.label || key}" because it is currently assigned to ${assignedCount} team member(s). Please reassign their roles first.`,
        400
      );
    }

    await Role.deleteOne({ _id: role._id });
    invalidateRoleCache();

    return ok({ deleted: true, key });
  } catch (error) {
    return apiError(error);
  }
}
