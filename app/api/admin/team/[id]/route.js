import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { AdminUser, Role } from '@/models/index';
import { requirePermission } from '@/lib/roles';
import { hashPassword } from '@/lib/auth';
import { ok, fail, jsonBody, apiError } from '@/lib/http';

const updateMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.string().min(2).max(50).optional(),
  active: z.boolean().optional(),
  forceLogout: z.boolean().optional(),
  password: z.string().min(8).max(128).optional()
});

export async function GET(request, { params }) {
  const actor = await requirePermission('team.manage');
  if (!actor) return fail('Permission denied. Requires team.manage privileges.', 403);

  const { id } = await params;

  try {
    await connectDB();
    const user = await AdminUser.findById(id, '-passwordHash').lean();
    if (!user) return fail('Team member not found.', 404);

    return ok({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active !== false,
      tokenVersion: user.tokenVersion || 1,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  const actor = await requirePermission('team.manage');
  if (!actor) return fail('Permission denied. Requires team.manage privileges.', 403);

  const { id } = await params;
  const body = await jsonBody(request);
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message || 'Invalid update payload.', 400);
  }

  try {
    await connectDB();
    const user = await AdminUser.findById(id);
    if (!user) return fail('Team member not found.', 404);

    const isTargetSuperAdmin = user.role === 'super-admin';
    const isActorSuperAdmin = actor.role === 'super-admin';

    // Guard: Non-super-admins cannot edit a super-admin
    if (isTargetSuperAdmin && !isActorSuperAdmin) {
      return fail('Only a Super Admin can modify another Super Admin account.', 403);
    }

    // Guard: Only super-admin can assign the super-admin role
    if (parsed.data.role === 'super-admin' && !isActorSuperAdmin) {
      return fail('Only a Super Admin can elevate an account to Super Admin.', 403);
    }

    // Guard: Cannot change own role
    if (String(user._id) === String(actor.sub) && parsed.data.role && parsed.data.role !== user.role) {
      return fail('You cannot change your own role. Another administrator must perform this action.', 400);
    }

    // Guard: Sole active super-admin cannot be deactivated or demoted
    if (isTargetSuperAdmin) {
      const willDemote = parsed.data.role && parsed.data.role !== 'super-admin';
      const willDeactivate = parsed.data.active === false;

      if (willDemote || willDeactivate) {
        const activeSuperAdminCount = await AdminUser.countDocuments({
          role: 'super-admin',
          active: true,
          _id: { $ne: user._id }
        });
        if (activeSuperAdminCount === 0) {
          return fail('Cannot deactivate or demote the last remaining Super Admin.', 400);
        }
      }
    }

    // If changing role, verify role exists
    if (parsed.data.role && parsed.data.role !== user.role) {
      const isSystem = ['super-admin', 'admin', 'finance', 'warehouse', 'marketing', 'support'].includes(parsed.data.role);
      const exists = await Role.findOne({ $or: [{ key: parsed.data.role }, { name: parsed.data.role }] });
      if (!isSystem && !exists) {
        return fail(`Role "${parsed.data.role}" does not exist.`, 400);
      }
      user.role = parsed.data.role;
    }

    if (parsed.data.name) user.name = parsed.data.name.trim();
    if (parsed.data.active !== undefined) user.active = parsed.data.active;

    // Reset password
    if (parsed.data.password) {
      user.passwordHash = await hashPassword(parsed.data.password);
      user.tokenVersion = (user.tokenVersion || 1) + 1; // Invalidate current session
    }

    // Force logout
    if (parsed.data.forceLogout) {
      user.tokenVersion = (user.tokenVersion || 1) + 1;
    }

    await user.save();

    return ok({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active !== false,
      tokenVersion: user.tokenVersion || 1,
      lastLoginAt: user.lastLoginAt || null
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const actor = await requirePermission('team.manage');
  if (!actor) return fail('Permission denied. Requires team.manage privileges.', 403);

  const { id } = await params;

  // Cannot delete self
  if (String(id) === String(actor.sub)) {
    return fail('You cannot delete your own administrative account.', 400);
  }

  try {
    await connectDB();
    const user = await AdminUser.findById(id);
    if (!user) return fail('Team member not found.', 404);

    if (user.role === 'super-admin') {
      if (actor.role !== 'super-admin') {
        return fail('Only a Super Admin can delete another Super Admin.', 403);
      }
      const superAdminCount = await AdminUser.countDocuments({ role: 'super-admin' });
      if (superAdminCount <= 1) {
        return fail('Cannot delete the sole Super Admin account.', 400);
      }
    }

    await AdminUser.deleteOne({ _id: user._id });

    return ok({ deleted: true, id });
  } catch (error) {
    return apiError(error);
  }
}
