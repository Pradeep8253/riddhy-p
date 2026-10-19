import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { AdminUser, Role } from '@/models/index';
import { requirePermission } from '@/lib/roles';
import { hashPassword } from '@/lib/auth';
import { ok, fail, jsonBody, apiError } from '@/lib/http';

const inviteSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  role: z.string().min(2).max(50),
  password: z.string().min(8).max(128).optional()
});

export async function GET() {
  const actor = await requirePermission('team.manage');
  if (!actor) return fail('Permission denied. Requires team.manage privileges.', 403);

  try {
    await connectDB();
    const members = await AdminUser.find({}, '-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = members.map((m) => ({
      id: String(m._id),
      name: m.name || m.email.split('@')[0],
      email: m.email,
      role: m.role || 'support',
      active: m.active !== false,
      tokenVersion: m.tokenVersion || 1,
      lastLoginAt: m.lastLoginAt || null,
      createdAt: m.createdAt
    }));

    return ok(formatted);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  const actor = await requirePermission('team.manage');
  if (!actor) return fail('Permission denied. Requires team.manage privileges.', 403);

  const body = await jsonBody(request);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message || 'Invalid team member data.', 400);
  }

  const { name, email, role, password } = parsed.data;

  // Only super-admin can create super-admin
  if (role === 'super-admin' && actor.role !== 'super-admin') {
    return fail('Only a Super Admin can invite another Super Admin.', 403);
  }

  try {
    await connectDB();

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return fail(`A team member with email ${email} already exists.`, 409);
    }

    // Verify role exists in DB or system roles
    const roleExists = await Role.findOne({ $or: [{ key: role }, { name: role }] });
    const isSystemRole = ['super-admin', 'admin', 'finance', 'warehouse', 'marketing', 'support'].includes(role);
    if (!roleExists && !isSystemRole) {
      return fail(`Role "${role}" does not exist in the system.`, 400);
    }

    // Generate random 10-char temporary password if not supplied
    const initialPassword = password || `Rf#${Math.random().toString(36).slice(-6)}!${Math.floor(Math.random() * 90 + 10)}`;
    const passwordHash = await hashPassword(initialPassword);

    const user = await AdminUser.create({
      name,
      email,
      role,
      passwordHash,
      active: true,
      tokenVersion: 1
    });

    return ok(
      {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        temporaryPassword: password ? undefined : initialPassword
      },
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
