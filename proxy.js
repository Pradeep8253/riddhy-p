import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
const ADMIN_ROLES = new Set(['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']);
export async function proxy(request) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const token = request.cookies.get('rf_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
  try {
    const secretValue = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'local-dev-secret-change-before-deploy-32-chars' : '');
    if (secretValue.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret, { issuer: 'rf-riddhy' });
    if (!ADMIN_ROLES.has(payload.role)) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('rf_session');
    return response;
  }
}
export const config = { matcher: ['/admin/:path*'] };
