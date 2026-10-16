import nodemailer from 'nodemailer';
let transport;
export function getMailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transport) transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  return transport;
}
export async function sendMail({ to, subject, text, html }) {
  const mailer = getMailer();
  if (!mailer) return { skipped: true };
  return mailer.sendMail({ from: process.env.SMTP_FROM || 'RF Riddhy <noreply@riddhy.in>', to, subject, text, html });
}
