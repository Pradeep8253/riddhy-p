import { connectDB } from '@/lib/db';
import { Lead } from '@/models/index';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mailer';
import { checkServiceability } from '@/lib/serviceability';
import { consultationSchema } from '@/lib/validators';
import { siteConfig } from '@/lib/site-config';
import { getLiveSiteConfig } from '@/lib/server-config';

function generateReference() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RC-${yy}${mm}${dd}-${rand}`;
}

export async function POST(request) {
  const ip = getClientIp(request);

  // Parse body
  const body = await jsonBody(request);
  if (!body) {
    return fail('Invalid request body.', 400);
  }

  // Honeypot & bot detection
  if (body.honeypot && String(body.honeypot).trim().length > 0) {
    return ok({
      received: true,
      reference: generateReference(),
      message: 'Thank you. Your consultation request has been received.'
    }, 201);
  }

  if (typeof body.submitDuration === 'number' && body.submitDuration < 2000) {
    return ok({
      received: true,
      reference: generateReference(),
      message: 'Thank you. Your consultation request has been received.'
    }, 201);
  }

  // Validate inputs
  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Please check your consultation booking details.', 400, parsed.error.flatten());
  }

  const data = parsed.data;

  // Rate limiting (by IP and by Phone number)
  if (!rateLimit(`consultation:ip:${ip}`, { limit: 8, windowMs: 3600000 }).allowed) {
    return fail('Too many requests from this network. Please wait a while before requesting another consultation.', 429);
  }

  if (!rateLimit(`consultation:phone:${data.phone}`, { limit: 4, windowMs: 3600000 }).allowed) {
    return fail('A consultation request was recently submitted for this phone number. Please wait a while before submitting another.', 429);
  }

  // Check serviceability (do NOT reject non-serviceable; record status)
  const serviceCheck = checkServiceability(data.pincode);
  const isServiceable = Boolean(serviceCheck.serviceable);

  // Preferred date formatting
  const slotDate = new Date(data.preferredDate);
  const startOfDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), 23, 59, 59);

  try {
    let lead = null;
    let emailed = false;
    let reference = generateReference();

    if (process.env.MONGODB_URI) {
      await connectDB();

      // Duplicate guard: same phone + same date within 24h
      const existing = await Lead.findOne({
        kind: 'consultation',
        phone: data.phone,
        preferredDate: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existing) {
        return ok({
          received: true,
          persisted: true,
          reference: existing.reference || generateReference(),
          duplicate: true,
          message: `A consultation is already scheduled for this mobile number on ${data.preferredDate}. Reference: ${existing.reference}`
        });
      }

      // Check slot capacity
      const bookedCount = await Lead.countDocuments({
        kind: 'consultation',
        preferredDate: { $gte: startOfDay, $lte: endOfDay },
        timeWindow: data.timeWindow,
        status: { $in: ['new', 'in_progress', 'scheduled'] }
      });

      const liveConfig = await getLiveSiteConfig();
      const maxCapacity = liveConfig.consultation.capacityPerSlot;
      if (bookedCount >= maxCapacity) {
        return fail(`The selected ${data.timeWindow} window on ${data.preferredDate} is fully booked. Please select an alternative slot or day.`, 409);
      }

      // Persist lead
      lead = await Lead.create({
        kind: 'consultation',
        reference,
        name: data.name,
        email: data.email ? data.email.toLowerCase() : '',
        phone: data.phone,
        pincode: data.pincode,
        interest: data.interests,
        roomType: data.roomType,
        budgetRange: data.budgetRange || '',
        timeline: data.timeline,
        mode: data.mode,
        preferredDate: slotDate,
        timeWindow: data.timeWindow,
        altDate: data.altDate ? new Date(data.altDate) : undefined,
        altTimeWindow: data.altTimeWindow || '',
        language: data.language,
        whatsappOptIn: data.whatsappOptIn,
        consentAt: new Date(),
        serviceable: isServiceable,
        attachments: data.attachments || [],
        message: data.message || '',
        status: 'new',
        source: 'website',
        ip
      });
    }

    // Email dispatch (Customer & Team)
    try {
      const teamMail = sendMail({
        to: process.env.SMTP_FROM || 'riddhyfurnitureshomeappliances@gmail.com',
        subject: `New Home Consultation: ${reference} (${data.name})`,
        text: `Consultation Reference: ${reference}\nCustomer: ${data.name} (${data.phone}${data.email ? ', ' + data.email : ''})\nPincode: ${data.pincode} (Serviceable: ${isServiceable ? 'Yes' : 'No'})\nMode: ${data.mode.toUpperCase()}\nPreferred Slot: ${data.preferredDate} [${data.timeWindow}]\nInterests: ${data.interests.join(', ')}\nRoom: ${data.roomType} | Budget: ${data.budgetRange || 'Not specified'}\nTimeline: ${data.timeline}\nLanguage: ${data.language}\nWhatsApp Updates: ${data.whatsappOptIn ? 'Yes' : 'No'}\n\nNotes:\n${data.message || 'None'}`
      });

      let customerMail = Promise.resolve({ skipped: true });
      if (data.email) {
        customerMail = sendMail({
          to: data.email,
          subject: `Your Consultation Booking with RF Riddhy [Ref: ${reference}]`,
          text: `Dear ${data.name},\n\nThank you for booking a consultation with RF Riddhy.\n\nYour consultation details:\nReference: ${reference}\nDate: ${data.preferredDate}\nTime Window: ${data.timeWindow}\nMode: ${data.mode}\n\nOur team will connect with you at your chosen time.\n\nWarm regards,\nRF Riddhy Team`
        });
      }

      const [teamResult] = await Promise.all([teamMail, customerMail]);
      emailed = !teamResult.skipped;

      if (lead && emailed) {
        await Lead.updateOne({ _id: lead._id }, { $set: { emailSent: true } });
      }
    } catch (emailErr) {
      console.warn('[Consultation Email Warning]', emailErr.message);
    }

    if (!lead && !emailed) {
      return ok({
        received: true,
        demoOnly: true,
        reference,
        persisted: false,
        emailed: false,
        message: 'Your consultation has been noted. In this local demonstration mode without DB/SMTP configured, the booking is simulated.'
      }, 201);
    }

    return ok({
      received: true,
      reference,
      persisted: Boolean(lead),
      emailed,
      message: `Thank you! Your home consultation has been booked. Reference: ${reference}`
    }, 201);
  } catch (error) {
    console.error('[Consultation API Error]', error);
    return fail(
      process.env.NODE_ENV === 'production'
        ? 'Unable to complete your consultation booking right now. Please try again.'
        : error.message,
      500
    );
  }
}
