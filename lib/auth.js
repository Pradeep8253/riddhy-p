import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE = 'rf_session';
function secretKey() {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'local-dev-secret-change-before-deploy-32-chars' : '');
  if (secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(secret);
}

export async function signSession(user) {
  return new SignJWT({ sub: String(user._id || user.id), role: user.role || 'customer', email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setIssuer('rf-riddhy').setIssuedAt().setExpirationTime('7d').sign(secretKey());
}

export async function readSession(token) {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secretKey(), { issuer: 'rf-riddhy' }); return payload; }
  catch { return null; }
}

export async function getSession() {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value);
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 };
}

export async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }
export async function hashPassword(password) { return bcrypt.hash(password, 12); }
export const SESSION_COOKIE = COOKIE;
