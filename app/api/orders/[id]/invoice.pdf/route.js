import { connectDB } from '@/lib/db';
import { Order, Invoice } from '@/models/index';
import { getSession } from '@/lib/auth';
import { fail } from '@/lib/http';
import { generateInvoiceForOrder } from '@/lib/invoice-generator';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';

export async function GET(request, { params }) {
  const session = await getSession();
  const { id } = await params;
  const url = new URL(request.url);
  const download = url.searchParams.get('download') === '1';
  const qOrderNumber = (url.searchParams.get('orderNumber') || '').trim();
  const qPhone = (url.searchParams.get('phone') || '').trim().replace(/[^0-9]/g, '');

  try {
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return fail('Order not found.', 404);

    let isAuthorized = false;
    if (session) {
      const isOwner = String(order.userId) === String(session.sub) || (order.phone && order.phone === session.phone);
      const isAdmin = ['admin', 'super-admin', 'finance'].includes(session.role);
      if (isOwner || isAdmin) isAuthorized = true;
    }

    if (!isAuthorized && qOrderNumber && qPhone) {
      const phoneMatch = order.phone && order.phone.replace(/[^0-9]/g, '').endsWith(qPhone.slice(-10));
      const orderMatch = order.orderNumber && order.orderNumber.toLowerCase() === qOrderNumber.toLowerCase();
      if (phoneMatch && orderMatch) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return fail('Sign in or provide matching order reference and registered phone number to view this invoice.', 403);
    }

    let invoice = await Invoice.findOne({ orderId: id }).lean();
    if (!invoice) {
      invoice = await generateInvoiceForOrder(id, { actor: session });
    }

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
  } catch (error) {
    console.error('Invoice PDF error:', error);
    return fail(error.message || 'Unable to generate invoice PDF.', 400);
  }
}
