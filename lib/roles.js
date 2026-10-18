import { getSession } from './auth.js';

const defaultAdminRoles = new Set(['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']);

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
  const isAuthorized = Boolean(session && session.role && targetRoles.has(session.role));

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
