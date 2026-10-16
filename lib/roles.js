import { getSession } from './auth.js';
const adminRoles = new Set(['admin','super-admin','support','warehouse','marketing','finance']);
export async function requireAdmin(roles = adminRoles) {
  const session = await getSession();
  if (!session || !roles.has(session.role)) return null;
  return session;
}
export async function requireCustomer() {
  const session = await getSession();
  return session?.role === 'customer' ? session : null;
}
