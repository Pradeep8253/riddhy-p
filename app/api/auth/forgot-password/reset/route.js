import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User, AdminUser, AuthOtp } from '@/models/index';
import { hashPassword } from '@/lib/auth';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  newPassword: z.string().min(1).max(128),
  userType: z.enum(['user', 'admin']).default('user')
});

export async function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const body = await jsonBody(request);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return fail('Please check your input details. All fields are required.', 400);
  }

  const { email: rawEmail, otp: rawOtp, newPassword, userType } = parsed.data;
  const email = rawEmail.toLowerCase().trim();
  const otp = rawOtp.trim();

  // Rate limit: max 10 reset attempts per 15 minutes
  const limitKey = `otp-verify:${ip}:${email}`;
  if (!rateLimit(limitKey, { limit: 10, windowMs: 15 * 60 * 1000 }).allowed) {
    return fail('Too many invalid attempts. Please request a fresh OTP.', 429);
  }

  try {
    await connectDB();

    // Verify OTP record exists and is not expired
    const otpRecord = await AuthOtp.findOne({
      email,
      otp,
      purpose: 'password_reset',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return fail('Invalid or expired OTP. Please verify the code or request a new one.', 400);
    }

    // Hash the new password with bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Update the password in the corresponding user collection
    if (userType === 'admin') {
      const updated = await AdminUser.findOneAndUpdate(
        { email, active: true },
        { passwordHash, lastLoginAt: new Date() }
      );
      if (!updated) {
        return fail('Administrator account not found.', 404);
      }
    } else {
      const updated = await User.findOneAndUpdate(
        { email, active: true },
        { passwordHash }
      );
      if (!updated) {
        return fail('User account not found.', 404);
      }
    }

    // Invalidate and delete all used OTPs for this email
    await AuthOtp.deleteMany({ email, purpose: 'password_reset' });

    return ok({
      message: 'Password reset successfully! You can now sign in with your new password.',
      email
    });
  } catch (error) {
    console.error('[Reset Password Error]', error);
    return fail(
      process.env.NODE_ENV === 'production'
        ? 'Could not reset password. Please try again.'
        : error.message,
      500
    );
  }
}
