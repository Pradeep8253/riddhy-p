import nodemailer from 'nodemailer';

let transport;

export function getMailer() {
  const user = process.env.USER_MAIL || process.env.SMTP_USER;
  const rawPass = process.env.MAIL_PASS || process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : null;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
  const secure = port === 465;

  if (!user || !pass) return null;

  if (!transport) {
    transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transport;
}

export async function sendMail({ to, subject, text, html }) {
  const mailer = getMailer();
  if (!mailer) {
    console.warn('[Mailer] Mailer skipped: USER_MAIL/MAIL_PASS or SMTP credentials not configured.');
    return { skipped: true };
  }
  const from = process.env.SMTP_FROM || `RF Riddhy <${process.env.USER_MAIL || process.env.SMTP_USER}>`;
  return mailer.sendMail({ from, to, subject, text, html });
}
