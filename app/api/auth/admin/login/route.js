import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/index';
import { signSession,verifyPassword,SESSION_COOKIE,sessionCookieOptions } from '@/lib/auth';
import { ok,fail,jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({email:z.string().email(),password:z.string().min(1).max(128)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`admin-login:${ip}`,{limit:6,windowMs:15*60000}).allowed)return fail('Too many admin sign-in attempts. Try again in 15 minutes.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Enter a valid email and password.',400);
  try {
    await connectDB();
    const admin = await AdminUser.findOne({ email: parsed.data.email.toLowerCase(), active: true });

    if (admin?.lockoutUntil && admin.lockoutUntil > new Date()) {
      const waitMin = Math.max(1, Math.ceil((admin.lockoutUntil.getTime() - Date.now()) / 60000));
      return fail(`Account temporarily locked due to multiple failed attempts. Please retry in ${waitMin} minute(s).`, 429);
    }

    if (!admin || !await verifyPassword(parsed.data.password, admin.passwordHash)) {
      if (admin) {
        admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
        if (admin.failedLoginAttempts >= 5) {
          admin.lockoutUntil = new Date(Date.now() + 15 * 60000);
        }
        await admin.save();
      }
      return fail('Email or password is incorrect.', 401);
    }

    admin.failedLoginAttempts = 0;
    admin.lockoutUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = await signSession(admin);
    const response = ok({ id: String(admin._id), name: admin.name, email: admin.email, role: admin.role });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return fail(process.env.NODE_ENV === 'production' ? 'Sign in is temporarily unavailable.' : error.message, 503);
  }
}
