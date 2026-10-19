import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Role, AdminUser } from '@/models/index';
import { requirePermission, invalidateRoleCache } from '@/lib/roles';
import { ok, fail, jsonBody, apiError } from '@/lib/http';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';

const SYSTEM_ROLES = [
  { key: 'super-admin', label: 'Super Admin', description: 'Unrestricted system access to all company & operational capabilities', permissions: [...ALL_PERMISSIONS], isSystem: true, system: true },
  { key: 'admin', label: 'Operations Admin', description: 'Full administration across catalogue, orders, settings, and team', permissions: [...DEFAULT_ROLE_PERMISSIONS.admin], isSystem: true, system: true },
  { key: 'finance', label: 'Finance & Accounts', description: 'Access to GST invoices, credit notes, sales data, and GSTR-1 exports', permissions: [...DEFAULT_ROLE_PERMISSIONS.finance], isSystem: true, system: true },
  { key: 'warehouse', label: 'Warehouse & Logistics', description: 'Order fulfillment, dispatch status updates, and stock inventory', permissions: [...DEFAULT_ROLE_PERMISSIONS.warehouse], isSystem: true, system: true },
  { key: 'marketing', label: 'Merchandising & Growth', description: 'Catalogue management, banners, collections, and promotions', permissions: [...DEFAULT_ROLE_PERMISSIONS.marketing], isSystem: true, system: true },
  { key: 'support', label: 'Customer Support', description: 'Handling customer inquiries, leads, and warranty claims', permissions: [...DEFAULT_ROLE_PERMISSIONS.support], isSystem: true, system: true }
];

const createRoleSchema = z.object({
  key: z.string().min(2).max(32).regex(/^[a-z0-9-]+$/, 'Key must be lowercase letters, numbers, and hyphens'),
  label: z.string().min(2).max(64).trim(),
  description: z.string().max(256).optional().default(''),
  permissions: z.array(z.string()).default([])
});

export async function GET() {
  const actor = await requirePermission('roles.manage');
  if (!actor) return fail('Permission denied. Requires roles.manage privileges.', 403);

  try {
    await connectDB();

    // Ensure all 6 default system roles exist in DB
    for (const sysRole of SYSTEM_ROLES) {
      const exists = await Role.findOne({ $or: [{ key: sysRole.key }, { name: sysRole.key }] });
      if (!exists) {
        await Role.create({
          key: sysRole.key,
          name: sysRole.key,
          label: sysRole.label,
          description: sysRole.description,
          permissions: sysRole.permissions,
          isSystem: true,
          system: true
        });
      }
    }

    const roles = await Role.find({}).sort({ isSystem: -1, createdAt: 1 }).lean();

    // Map user count per role
    const userCounts = await AdminUser.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(userCounts.map((u) => [u._id, u.count]));

    const enriched = roles.map((r) => {
      const roleKey = r.key || r.name;
      return {
        id: String(r._id),
        key: roleKey,
        label: r.label || roleKey,
        description: r.description || '',
        permissions: roleKey === 'super-admin' ? [...ALL_PERMISSIONS] : (Array.isArray(r.permissions) ? r.permissions : []),
        isSystem: Boolean(r.isSystem ?? r.system),
        userCount: countMap[roleKey] || 0,
        updatedAt: r.updatedAt
      };
    });

    return ok(enriched);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  const actor = await requirePermission('roles.manage');
  if (!actor) return fail('Permission denied. Requires roles.manage privileges.', 403);

  const body = await jsonBody(request);
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message || 'Invalid role payload.', 400);
  }

  const { key, label, description, permissions } = parsed.data;

  if (['super-admin', 'admin', 'customer'].includes(key)) {
    return fail(`Role key "${key}" is reserved and cannot be created.`, 400);
  }

  try {
    await connectDB();

    const existing = await Role.findOne({ $or: [{ key }, { name: key }] });
    if (existing) {
      return fail(`A role with key "${key}" already exists.`, 409);
    }

    // Filter valid permissions
    const validPerms = permissions.filter((p) => ALL_PERMISSIONS.includes(p));

    const newRole = await Role.create({
      key,
      name: key,
      label,
      description,
      permissions: validPerms,
      isSystem: false,
      system: false,
      updatedBy: actor.sub,
      updatedByEmail: actor.email || ''
    });

    invalidateRoleCache();

    return ok(
      {
        id: String(newRole._id),
        key: newRole.key,
        label: newRole.label,
        description: newRole.description,
        permissions: newRole.permissions,
        isSystem: false,
        userCount: 0
      },
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
