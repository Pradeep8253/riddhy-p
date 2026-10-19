import { connectDB } from '@/lib/db';
import { Invoice, CreditNote, Order } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, apiError } from '@/lib/http';
import { generateCreditNoteForRefund } from '@/lib/invoice-generator';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';
import { sendMail } from '@/lib/mailer';
import { getCompanySettings, validateCompanyForInvoicing } from '@/lib/company-settings';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const actor = await requireAdmin(new Set(['super-admin', 'admin', 'finance']));
  if (!actor) {
    return fail('Admin permission required.', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);

    const q = (url.searchParams.get('q') || '').trim();
    const financialYear = url.searchParams.get('financialYear');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const buyerType = url.searchParams.get('buyerType'); // 'b2b' | 'b2c'
    const stateType = url.searchParams.get('stateType'); // 'intra' | 'inter'
    const hasCreditNote = url.searchParams.get('hasCreditNote'); // 'yes' | 'no'
    const status = url.searchParams.get('status'); // 'issued' | 'void'
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const type = url.searchParams.get('type'); // 'credit_notes' or 'invoices'

    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') || 25)));

    // Return Credit Notes list
    if (type === 'credit_notes') {
      const cnFilter = {};
      if (q) {
        cnFilter.$or = [
          { creditNoteNumber: { $regex: q, $options: 'i' } },
          { invoiceNumber: { $regex: q, $options: 'i' } },
          { orderNumber: { $regex: q, $options: 'i' } }
        ];
      }
      if (financialYear && financialYear !== 'all') {
        cnFilter.financialYear = financialYear;
      }

      const [notes, totalNotes] = await Promise.all([
        CreditNote.find(cnFilter)
          .sort({ issuedAt: -1, sequenceNumber: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        CreditNote.countDocuments(cnFilter)
      ]);

      return ok(
        notes.map((n) => ({ ...n, id: String(n._id), _id: undefined })),
        200,
        { page, limit, total: totalNotes, pages: Math.ceil(totalNotes / limit) }
      );
    }

    // Invoice list filtering
    const filter = {};
    if (q) {
      filter.$or = [
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'buyer.name': { $regex: q, $options: 'i' } },
        { 'buyer.businessName': { $regex: q, $options: 'i' } },
        { 'buyer.gstin': { $regex: q, $options: 'i' } }
      ];
    }

    if (financialYear && financialYear !== 'all') {
      filter.financialYear = financialYear;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (buyerType === 'b2b') {
      filter['buyer.isB2B'] = true;
    } else if (buyerType === 'b2c') {
      filter['buyer.isB2B'] = { $ne: true };
    }

    if (stateType === 'intra') {
      filter.isInterState = false;
    } else if (stateType === 'inter') {
      filter.isInterState = true;
    }

    if (hasCreditNote === 'yes') {
      filter.$or = [
        { creditNoteId: { $exists: true, $ne: null } },
        { 'creditNotes.0': { $exists: true } }
      ];
    } else if (hasCreditNote === 'no') {
      filter.creditNoteId = { $in: [null, undefined] };
      filter['creditNotes.0'] = { $exists: false };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (from || to) {
      filter.invoiceDate = {};
      if (from) filter.invoiceDate.$gte = new Date(from);
      if (to) filter.invoiceDate.$lte = new Date(to);
    }

    const [invoices, total, totalsAgg, creditNotesAgg] = await Promise.all([
      Invoice.find(filter)
        .sort({ invoiceDate: -1, sequenceNumber: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
      Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: '$totalAmount' },
            taxableTotal: { $sum: '$taxableAmount' },
            cgstTotal: { $sum: '$cgstTotal' },
            sgstTotal: { $sum: '$sgstTotal' },
            igstTotal: { $sum: '$igstTotal' },
            totalTax: { $sum: '$totalTax' },
            paidTotal: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] }
            },
            unpaidTotal: {
              $sum: { $cond: [{ $ne: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] }
            }
          }
        }
      ]),
      CreditNote.aggregate([
        ...(financialYear && financialYear !== 'all' ? [{ $match: { financialYear } }] : []),
        {
          $group: {
            _id: null,
            creditNotesTotal: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const stats = totalsAgg[0] || {
      totalInvoiced: 0,
      taxableTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      totalTax: 0,
      paidTotal: 0,
      unpaidTotal: 0
    };

    const summary = {
      ...stats,
      creditNotesTotal: creditNotesAgg[0]?.creditNotesTotal || 0
    };

    const companyDoc = await getCompanySettings().catch(() => null);
    const companyValidation = validateCompanyForInvoicing(companyDoc);

    return ok(
      invoices.map((inv) => ({
        ...inv,
        id: String(inv._id),
        _id: undefined
      })),
      200,
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        summary,
        companyValidation
      }
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['super-admin', 'admin', 'finance']));
  if (!actor) {
    return fail('Admin permission required.', 403);
  }

  try {
    await connectDB();
    const body = await request.json();
    const { action, invoiceId, orderId, amount, reason, email } = body;

    // 1. Issue Credit Note
    if (action === 'credit_note') {
      if (!orderId || !amount) {
        return fail('Order ID and refund amount are required.', 400);
      }
      const note = await generateCreditNoteForRefund(orderId, amount, reason || 'Order return / refund', actor);
      return ok({ creditNote: note, message: 'Credit Note issued successfully.' });
    }

    // 2. Email Invoice to Customer
    if (action === 'email') {
      if (!invoiceId) return fail('Invoice ID is required.', 400);
      const invoice = await Invoice.findById(invoiceId).lean();
      if (!invoice) return fail('Invoice not found.', 404);

      const targetEmail = (email || invoice.buyer?.email || '').trim();
      if (!targetEmail) {
        return fail('No customer email address on record for this invoice.', 400);
      }

      const pdfBuffer = await generateInvoicePdfBuffer(invoice);
      const cleanNumber = (invoice.invoiceNumber || 'INV').replace(/[\/\\?%*:|"<>]/g, '_');
      const filename = `Invoice_${cleanNumber}.pdf`;

      const subject = `Your Tax Invoice from RF Riddhy: ${invoice.invoiceNumber}`;
      const text = `Dear ${invoice.buyer?.name || 'Customer'},\n\nPlease find attached your official GST Tax Invoice (${invoice.invoiceNumber}) for order ${invoice.orderNumber}.\n\nTotal Amount: Rs. ${invoice.totalAmount}\nDate: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}\n\nThank you for choosing RF Riddhy.\nhttps://rfriddhy.com`;
      const html = `<div style="font-family: sans-serif; color: #1e2420; max-width: 600px; padding: 20px;">
        <h2 style="color: #1b5e20;">Tax Invoice ${invoice.invoiceNumber}</h2>
        <p>Dear ${invoice.buyer?.name || 'Customer'},</p>
        <p>Thank you for choosing <strong>RF Riddhy</strong>. Your official GST tax invoice for order <strong>${invoice.orderNumber}</strong> is attached to this email.</p>
        <div style="background: #f4efe7; padding: 14px 18px; border-radius: 8px; margin: 18px 0;">
          <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Total Amount:</strong> Rs. ${invoice.totalAmount}</p>
          <p style="margin: 4px 0;"><strong>Payment Status:</strong> ${(invoice.paymentStatus || 'paid').toUpperCase()}</p>
        </div>
        <p>If you have any questions regarding your warranty or installation, visit our <a href="https://rfriddhy.com/warranty" style="color: #1b5e20;">Warranty Portal</a> or reply directly to this email.</p>
        <hr style="border: none; border-top: 1px solid #e0d9cc; margin: 24px 0;" />
        <p style="font-size: 11px; color: #727e74;">RF Riddhy · Thoughtful Living & Dependable Appliances</p>
      </div>`;

      const mailRes = await sendMail({
        to: targetEmail,
        subject,
        text,
        html,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      // Record audit event
      await Invoice.findByIdAndUpdate(invoiceId, {
        $push: {
          events: {
            action: 'emailed',
            at: new Date(),
            by: actor.name || 'Admin',
            byEmail: actor.email,
            note: `Invoice PDF emailed to ${targetEmail}`
          }
        }
      });

      return ok({
        message: mailRes?.skipped
          ? `Invoice email logged (SMTP not configured in environment, PDF generated successfully).`
          : `Invoice PDF sent to ${targetEmail} successfully.`
      });
    }

    // 3. Void Invoice (Audit Trail)
    if (action === 'void') {
      if (!invoiceId) return fail('Invoice ID is required.', 400);
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) return fail('Invoice not found.', 404);

      if (invoice.status === 'void') {
        return fail('Invoice is already voided.', 400);
      }

      // Check if credit notes have already been issued
      const cnCount = await CreditNote.countDocuments({ invoiceId: invoice._id, status: { $ne: 'void' } });
      if (cnCount > 0) {
        return fail('Cannot void invoice with active credit notes. Issue an adjustment instead.', 400);
      }

      invoice.status = 'void';
      if (!invoice.events) invoice.events = [];
      invoice.events.push({
        action: 'voided',
        at: new Date(),
        by: actor.name || 'Admin',
        byEmail: actor.email,
        note: reason || 'Voided by finance administrator.'
      });
      await invoice.save();

      return ok({ message: `Invoice ${invoice.invoiceNumber} has been voided.` });
    }

    return fail('Invalid action specified.', 400);
  } catch (error) {
    return apiError(error);
  }
}
