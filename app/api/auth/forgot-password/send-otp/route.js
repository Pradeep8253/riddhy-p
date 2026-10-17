import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User, AdminUser, AuthOtp } from '@/models/index';
import { sendMail } from '@/lib/mailer';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
  userType: z.enum(['user', 'admin']).default('user')
});

export async function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const body = await jsonBody(request);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return fail('Please provide a valid email address.', 400);
  }

  const { email: rawEmail, userType } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  // Rate limit: max 5 OTP requests per 15 minutes per IP/email
  const limitKey = `otp-send:${ip}:${email}`;
  if (!rateLimit(limitKey, { limit: 5, windowMs: 15 * 60 * 1000 }).allowed) {
    return fail('Too many OTP requests. Please wait a few minutes before trying again.', 429);
  }

  try {
    await connectDB();

    // Verify account existence in the appropriate collection
    let account = null;
    if (userType === 'admin') {
      account = await AdminUser.findOne({ email, active: true });
    } else {
      account = await User.findOne({ email, active: true });
    }

    if (!account) {
      return fail(
        userType === 'admin'
          ? 'No active administrator account was found with this email.'
          : 'No account registered with this email. Please check the spelling or sign up.',
        404
      );
    }

    // Generate a secure 6-digit numeric OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Clear previous pending OTPs for this email and save the new one (10 min TTL)
    await AuthOtp.deleteMany({ email, purpose: 'password_reset' });
    await AuthOtp.create({
      email,
      otp,
      purpose: 'password_reset',
      userType,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send formatted email via SMTP
    const mailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0;padding:24px;background:#f8f6f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#142217;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e3ded5;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
        <div style="background:#142217;padding:28px;text-align:center;">
          <span style="display:inline-block;background:#c89332;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:0.1em;padding:4px 10px;border-radius:4px;text-transform:uppercase;margin-bottom:8px;">RF Riddhy Security</span>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.02em;">Password Reset Verification</h1>
        </div>
        <div style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f4941;">Hello ${account.name || 'there'},</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4f5850;">
            We received a request to reset the password for your <b>${userType === 'admin' ? 'RF Riddhy Admin' : 'RF Riddhy Store'}</b> account (<b>${email}</b>).
          </p>
          <div style="background:#f4eee2;border:1.5px dashed #c89332;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <span style="display:block;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#795548;margin-bottom:6px;">Your One-Time Password (OTP)</span>
            <span style="display:block;font-size:36px;font-weight:800;letter-spacing:0.25em;color:#142217;font-family:monospace;">${otp}</span>
            <span style="display:block;font-size:11px;color:#8d6e63;margin-top:6px;">Valid for 10 minutes</span>
          </div>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#617064;">
            Enter this code on the password reset screen to create a new password. If you did not make this request, your account remains secure and no action is needed.
          </p>
          <hr style="border:none;border-top:1px solid #ebe5dc;margin:28px 0;"/>
          <p style="margin:0;font-size:11px;color:#8a948c;text-align:center;">
            RF Riddhy Furniture & Home Appliances · Patna, Bihar<br/>
            This is an automated transmission from customer authentication services.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailRes = await sendMail({
      to: email,
      subject: `Your Password Reset OTP: ${otp} — RF Riddhy`,
      text: `Your RF Riddhy password reset code is: ${otp}. It is valid for 10 minutes.`,
      html: mailHtml
    });

    if (mailRes.skipped) {
      console.warn('[OTP Mailer] Email was skipped because SMTP is unconfigured.');
      return fail('Email service is temporarily unavailable. Please contact support.', 503);
    }

    return ok({
      message: 'A 6-digit OTP has been sent to your email address.',
      email
    });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return fail(
      process.env.NODE_ENV === 'production'
        ? 'Could not send verification OTP. Please try again.'
        : error.message,
      500
    );
  }
}
