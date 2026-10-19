import { getSession } from './auth.js';
import { connectDB } from './db.js';
import { Role, AdminUser } from '../models/index.js';
import { DEFAULT_ROLE_PERMISSIONS } from './permissions.js';

const defaultAdminRoles = new Set(['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']);

// In-memory cache for dynamic role permissions (45s TTL)
let roleCache = new Map();
let cacheExpiry = 0;
const CACHE_TTL_MS = 45000;

export function invalidateRoleCache() {
  roleCache.clear();
  cacheExpiry = 0;
}

/**
 * Retrieve permissions for a role key from DB with in-memory caching and fallback
 */
export async function getRolePermissions(roleKey) {
  if (!roleKey) return [];
  if (roleKey === 'super-admin') return ['*'];

  const now = Date.now();
  if (now < cacheExpiry && roleCache.has(roleKey)) {
    return roleCache.get(roleKey);
  }

  try {
    await connectDB();
    const roles = await Role.find({}).lean();
    roleCache.clear();
    for (const r of roles) {
      const k = r.key || r.name;
      if (k) roleCache.set(k, Array.isArray(r.permissions) ? r.permissions : []);
    }
    cacheExpiry = Date.now() + CACHE_TTL_MS;

    if (roleCache.has(roleKey)) {
      return roleCache.get(roleKey);
    }
  } catch {
    // DB unreachable, fallback to static defaults
  }

  return DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
}

/**
 * Enforce permission requirement for an API route or server action
 */
export async function requirePermission(permissionKey) {
  const session = await getSession();
  if (!session || !session.role) return null;

  if (session.role === 'super-admin') return session;

  if (session.sub) {
    try {
      await connectDB();
      const user = await AdminUser.findById(session.sub, 'active tokenVersion role').lean();
      if (user) {
        if (user.active === false) return null;
        if (user.tokenVersion && session.tokenVersion && user.tokenVersion !== session.tokenVersion) {
          return null;
        }
        if (user.role && user.role !== session.role) {
          session.role = user.role;
        }
      } else if (process.env.NODE_ENV === 'production') {
        return null;
      }
    } catch {
      // proceed if transient error
    }
  }

  const perms = await getRolePermissions(session.role);
  if (perms.includes('*') || perms.includes(permissionKey)) {
    return session;
  }

  return null;
}

export async function requireAdmin(...args) {
  let isLegacyStyle = false;
  let targetRoles = defaultAdminRoles;

  if (args.length === 1) {
    const first = args[0];
    if (first && typeof first.has === 'function') {
      targetRoles = first;
    } else if (Array.isArray(first)) {
      targetRoles = new Set(first);
    } else if (first && typeof first === 'object' && ('headers' in first || 'url' in first || 'nextUrl' in first)) {
      isLegacyStyle = true;
    }
  } else if (args.length >= 2) {
    isLegacyStyle = true;
    const second = args[1];
    if (second && typeof second.has === 'function') {
      targetRoles = second;
    } else if (Array.isArray(second)) {
      targetRoles = new Set(second);
    }
  }

  const session = await getSession();
  const isAuthorized = Boolean(
    session &&
    session.role &&
    session.role !== 'customer' &&
    (targetRoles.has(session.role) || defaultAdminRoles.has(session.role) || session.role === 'admin' || session.role === 'super-admin')
  );

  if (isLegacyStyle) {
    return {
      authorized: isAuthorized,
      user: isAuthorized ? session : null,
      message: isAuthorized ? null : 'Admin permission required.'
    };
  }

  return isAuthorized ? session : null;
}

export async function requireCustomer() {
  const session = await getSession();
  return session?.role === 'customer' ? session : null;
}

