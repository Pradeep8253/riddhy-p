import { connectDB } from '@/lib/db';
import { Lead } from '@/models/index';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mailer';
import { contactEnquirySchema } from '@/lib/validators';

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
  const body = await jsonBody(request);

  if (!body) {
    return fail('Invalid request body.', 400);
  }

  // Honeypot check
  if (body.honeypot && String(body.honeypot).trim().length > 0) {
    return ok({
      received: true,
      reference: generateReference(),
      message: 'Thank you. Your message has been received.'
    }, 201);
  }

  // Validate request
  const parsed = contactEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return fail('Please check your contact details.', 400, parsed.error.flatten());
  }

  const {
    inquiryType,
    name,
    email,
    phone,
    topic,
    subject,
    orderNumber,
    message,
    productName,
    category,
    quantity,
    budgetRange,
    deliveryLocation,
    preferredDate,
    specifications,
    intendedUse,
    preferredContactMethod,
    referenceImage
  } = parsed.data;

  // Rate limiting per IP and per Phone
  if (!rateLimit(`contact:ip:${ip}`, { limit: 8, windowMs: 3600000 }).allowed) {
    return fail('Please wait before sending another message.', 429);
  }
  if (!rateLimit(`contact:phone:${phone}`, { limit: 5, windowMs: 3600000 }).allowed) {
    return fail('A message was recently sent from this phone number. Please wait a short while.', 429);
  }

  try {
    let lead = null;
    let emailed = false;
    const reference = generateReference();

    // Map inquiryType to kind
    let kind = 'general';
    if (inquiryType === 'bulk') kind = 'bulk';
    else if (inquiryType === 'on_demand') kind = 'on_demand';
    else if (inquiryType === 'assistance') kind = 'consultation';
    else kind = 'contact';

    if (process.env.MONGODB_URI) {
      await connectDB();
      lead = await Lead.create({
        kind,
        reference,
        name,
        email: (email || '').toLowerCase(),
        phone,
        topic: topic || inquiryType || 'other',
        subject: subject || '',
        orderNumber: orderNumber || '',
        message: message || specifications || '',
        productName: productName || '',
        category: category || '',
        quantity: quantity || undefined,
        budgetRange: budgetRange || '',
        deliveryLocation: deliveryLocation || '',
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        specifications: specifications || '',
        intendedUse: intendedUse || '',
        preferredContactMethod: preferredContactMethod || 'phone',
        referenceImage: referenceImage || '',
        status: 'new',
        source: 'website',
        ip
      });
    }

    try {
      const typeLabel = `[${(inquiryType || 'INQUIRY').toUpperCase()}] `;
      const orderNote = orderNumber ? `\nOrder Number: ${orderNumber}` : '';
      const prodNote = productName ? `\nRequested Product: ${productName} (Qty: ${quantity || 1})` : '';
      const imgNote = referenceImage ? `\nReference Image: ${referenceImage}` : '';

      const result = await sendMail({
        to: process.env.SMTP_FROM || 'support@riddhy.in',
        subject: `Website ${typeLabel}from ${name} (Ref: ${reference})`,
        text: `Reference: ${reference}\nCustomer: ${name} (${phone}, ${email || 'N/A'})${orderNote}${prodNote}${imgNote}\n\nDetails:\n${message || specifications || 'No additional note'}`
      });
      emailed = !result.skipped;

      if (lead && emailed) {
        await Lead.updateOne({ _id: lead._id }, { $set: { emailSent: true } });
      }
    } catch (mailError) {
      console.warn('[Contact Mail Warning]', mailError.message);
    }

    if (!lead && !emailed) {
      return ok({
        received: true,
        demoOnly: true,
        reference,
        message: 'Thank you. Your inquiry has been received in demo preview mode.'
      }, 201);
    }

    return ok({
      received: true,
      reference,
      persisted: Boolean(lead),
      emailed,
      message: `Thank you. Your inquiry has been received. Our team will contact you shortly. Reference: ${reference}`
    }, 201);
  } catch (error) {
    console.error('[Contact API Error]', error);
    return fail(
      process.env.NODE_ENV === 'production'
        ? 'Unable to save your message right now. Please try again later.'
        : error.message,
      503
    );
  }
}
