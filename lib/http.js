import { NextResponse } from 'next/server';

export function ok(data, status = 200, meta) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function fail(message, status = 400, details) {
  return NextResponse.json({ success: false, data: null, error: { message, ...(details ? { details } : {}) } }, { status, headers: { 'Cache-Control': 'no-store' } });
}
export async function jsonBody(request) {
  try { return await request.json(); } catch { return null; }
}
export function clampPage(value) { return Math.max(1, Math.min(1000, Number.parseInt(value || '1', 10) || 1)); }
export function clampLimit(value, max = 48) { return Math.max(1, Math.min(max, Number.parseInt(value || '24', 10) || 24)); }
export function apiError(error) {
  console.error('[RF API]', error);
  return fail(process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : error.message, 500);
}
