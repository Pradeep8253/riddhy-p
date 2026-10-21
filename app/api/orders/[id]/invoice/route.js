import { connectDB } from '@/lib/db';
import { Order, Invoice } from '@/models/index';
import { getSession } from '@/lib/auth';
import { fail } from '@/lib/http';
import { generateInvoiceForOrder } from '@/lib/invoice-generator';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';
import { formatDateDDMMYYYY } from '@/lib/date-utils';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function formatInr(num) {
  return 'Rs. ' + Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return fail('Sign in to view this invoice.', 401);

  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  const download = url.searchParams.get('download') === '1';

  try {
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return fail('Order not found.', 404);

    // Permission check: owner, or admin/super-admin/finance
    const isOwner = String(order.userId) === String(session.sub) || (order.phone && order.phone === session.phone);
    const isAdmin = ['admin', 'super-admin', 'finance'].includes(session.role);
    if (!isOwner && !isAdmin) {
      return fail('You cannot view this invoice.', 403);
    }

    // Ensure formal GST Invoice is generated
    let invoice = await Invoice.findOne({ orderId: id }).lean();
    if (!invoice) {
      invoice = await generateInvoiceForOrder(id, { actor: session });
    }

    // PDF format response
    if (format === 'pdf') {
      const pdfBuffer = await generateInvoicePdfBuffer(invoice);
      const cleanNumber = (invoice.invoiceNumber || 'INV').replace(/[\/\\?%*:|"<>]/g, '_');
      const filename = `Invoice_${cleanNumber}.pdf`;
      const dispositionType = download ? 'attachment' : 'inline';

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${dispositionType}; filename="${filename}"`,
          'Cache-Control': 'private, no-transform, max-age=86400'
        }
      });
    }

    // HTML Print View
    const { seller, buyer, items, taxableAmount, cgstTotal, sgstTotal, igstTotal, totalAmount, isInterState, totalInWords } = invoice;
    const formattedDate = formatDateDDMMYYYY(invoice.invoiceDate);

    const rows = (items || []).map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(item.name)}</strong><small>SKU: ${escapeHtml(item.sku)} | HSN: ${escapeHtml(item.hsn)}</small></td>
        <td>${item.qty}</td>
        <td>${escapeHtml(formatInr(item.unitPrice))}</td>
        <td>${escapeHtml(formatInr(item.taxableValue))}</td>
        <td>${isInterState ? `IGST ${item.gstRate || 18}%<br>${escapeHtml(formatInr(item.igstAmount))}` : `CGST+SGST ${item.gstRate || 18}%<br>${escapeHtml(formatInr((item.cgstAmount || 0) + (item.sgstAmount || 0)))}`}</td>
        <td style="text-align: right;">${escapeHtml(formatInr(item.lineTotal))}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tax Invoice ${escapeHtml(invoice.invoiceNumber)} - RF Riddhy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e2420; margin: 0; padding: 40px; background: #f4efe7; }
    .paper { max-width: 860px; margin: auto; padding: 44px; background: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1b2e23; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { color: #1b2e23; font-size: 26px; font-weight: 800; font-family: Georgia, serif; }
    .tagline { color: #647065; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .inv-title { text-align: right; }
    .inv-title h1 { font-size: 22px; margin: 0 0 6px; color: #1b2e23; }
    .inv-title p { margin: 2px 0; font-size: 12px; color: #555; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; }
    .party-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1b5e20; margin: 0 0 8px; }
    .party-box p { margin: 3px 0; font-size: 13px; line-height: 1.4; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #f8f6f0; padding: 10px 8px; border-top: 1px solid #d5cec2; border-bottom: 1px solid #d5cec2; font-weight: 700; text-align: left; }
    td { padding: 12px 8px; border-bottom: 1px solid #eee8df; vertical-align: top; }
    small { display: block; color: #737e75; margin-top: 3px; font-size: 11px; }
    .totals-area { display: flex; justify-content: space-between; margin-top: 24px; }
    .words-box { max-width: 50%; font-size: 12px; }
    .words-box strong { display: block; margin-bottom: 4px; color: #1b2e23; }
    .words-text { font-style: italic; color: #555; }
    .totals-table { width: 340px; font-size: 13px; }
    .totals-table td { padding: 6px 8px; border: none; }
    .grand-total { font-size: 16px; font-weight: 800; color: #1b2e23; border-top: 2px solid #1b2e23 !important; background: #eef4ef; }
    .actions-bar { margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end; }
    .btn { padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; border: none; }
    .btn-primary { background: #1b5e20; color: #fff; }
    .btn-secondary { background: #f0ebe1; color: #1b2e23; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e0dbd0; font-size: 11px; color: #727e74; display: flex; justify-content: space-between; }
    @media print {
      body { background: #fff; padding: 0; }
      .paper { box-shadow: none; padding: 0; }
      .actions-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="paper">
    <div class="header">
      <div>
        <div class="brand">RF | RIDDHY</div>
        <div class="tagline">Thoughtful Living &amp; Dependable Appliances</div>
      </div>
      <div class="inv-title">
        <h1>TAX INVOICE</h1>
        <p><strong>Invoice No:</strong> ${escapeHtml(invoice.invoiceNumber)}</p>
        <p><strong>Invoice Date:</strong> ${formattedDate}</p>
        <p><strong>Order No:</strong> ${escapeHtml(invoice.orderNumber)}</p>
        <p><strong>Place of Supply:</strong> ${escapeHtml(invoice.placeOfSupply || seller?.state)}</p>
      </div>
    </div>

    <div class="parties">
      <div class="party-box">
        <h3>Sold By / Supplier</h3>
        <p><strong>${escapeHtml(seller?.name || 'RF Riddhy')}</strong></p>
        <p>${escapeHtml(seller?.address || '')}</p>
        <p>${escapeHtml(seller?.city || '')}, ${escapeHtml(seller?.state || '')} - ${escapeHtml(seller?.pincode || '')}</p>
        <p><strong>GSTIN:</strong> ${escapeHtml(seller?.gstin || '')} · <strong>PAN:</strong> ${escapeHtml(seller?.pan || '')}</p>
        <p>State Code: ${escapeHtml(seller?.stateCode || '')} · Email: ${escapeHtml(seller?.email || 'billing@rfriddhy.com')}</p>
      </div>

      <div class="party-box">
        <h3>Bill To / Recipient</h3>
        <p><strong>${escapeHtml(buyer?.isB2B ? buyer.businessName : buyer?.name)}</strong></p>
        <p>${escapeHtml(buyer?.billingAddress?.line1 || '')} ${escapeHtml(buyer?.billingAddress?.line2 || '')}</p>
        <p>${escapeHtml(buyer?.billingAddress?.city || '')}, ${escapeHtml(buyer?.state || '')} - ${escapeHtml(buyer?.billingAddress?.pincode || '')}</p>
        <p>Phone: ${escapeHtml(buyer?.phone || 'N/A')} · Email: ${escapeHtml(buyer?.email || 'N/A')}</p>
        <p>${buyer?.gstin ? `<strong>Buyer GSTIN:</strong> ${escapeHtml(buyer.gstin)} (B2B)` : 'Consumer / Unregistered Person (B2C)'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Description of Goods &amp; Services</th>
          <th style="width: 40px;">Qty</th>
          <th style="width: 90px;">Rate</th>
          <th style="width: 90px;">Taxable</th>
          <th style="width: 100px;">Tax Breakup</th>
          <th style="width: 100px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="words-box">
        <strong>Amount in Words:</strong>
        <div class="words-text">${escapeHtml(totalInWords || '')}</div>
        <div style="margin-top: 14px; color: #555;">
          <strong>Payment Status:</strong> ${(invoice.paymentStatus || 'paid').toUpperCase()}<br>
          <strong>Payment Mode:</strong> ${(invoice.paymentMode || 'online').toUpperCase()}
        </div>
      </div>

      <table class="totals-table">
        <tr>
          <td>Taxable Amount:</td>
          <td style="text-align: right;">${escapeHtml(formatInr(taxableAmount))}</td>
        </tr>
        ${isInterState ? `
          <tr>
            <td>Integrated Tax (IGST):</td>
            <td style="text-align: right;">${escapeHtml(formatInr(igstTotal))}</td>
          </tr>
        ` : `
          <tr>
            <td>Central Tax (CGST):</td>
            <td style="text-align: right;">${escapeHtml(formatInr(cgstTotal))}</td>
          </tr>
          <tr>
            <td>State Tax (SGST):</td>
            <td style="text-align: right;">${escapeHtml(formatInr(sgstTotal))}</td>
          </tr>
        `}
        ${invoice.deliveryFee > 0 ? `
          <tr>
            <td>Delivery Charges:</td>
            <td style="text-align: right;">${escapeHtml(formatInr(invoice.deliveryFee))}</td>
          </tr>
        ` : ''}
        ${invoice.installationFee > 0 ? `
          <tr>
            <td>Installation Charges:</td>
            <td style="text-align: right;">${escapeHtml(formatInr(invoice.installationFee))}</td>
          </tr>
        ` : ''}
        ${invoice.roundOff !== 0 ? `
          <tr>
            <td>Round Off:</td>
            <td style="text-align: right;">${escapeHtml(formatInr(invoice.roundOff))}</td>
          </tr>
        ` : ''}
        <tr class="grand-total">
          <td>Total Amount:</td>
          <td style="text-align: right;">${escapeHtml(formatInr(totalAmount))}</td>
        </tr>
      </table>
    </div>

    <div class="actions-bar">
      <button class="btn btn-secondary" onclick="window.print()">Print Invoice</button>
      <a class="btn btn-primary" href="/api/orders/${id}/invoice?format=pdf&download=1">Download PDF</a>
    </div>

    <div class="footer">
      <div>${escapeHtml(invoice.terms || 'Goods covered under RF Riddhy Warranty Policy.')}</div>
      <div>Subject to ${escapeHtml(invoice.jurisdictionCity || seller?.jurisdictionCity || 'local')} jurisdiction only.</div>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return fail(error.message || 'Unable to generate invoice.', 400);
  }
}
