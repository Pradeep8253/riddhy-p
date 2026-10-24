import { connectDB } from '@/lib/db';
import { Order, Invoice } from '@/models/index';
import { getSession } from '@/lib/auth';
import { fail } from '@/lib/http';
import { generateInvoiceForOrder } from '@/lib/invoice-generator';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const acceptHeader = request.headers.get('accept') || '';
    const isDirectBrowserNav = acceptHeader.includes('text/html');

    if (!session) {
      if (isDirectBrowserNav) {
        return Response.redirect(new URL('/account', request.url), 302);
      }
      return fail('Sign in to view or download this invoice.', 401);
    }

    const isOwner = String(order.userId) === String(session.sub) || (order.phone && order.phone === session.phone);
    const isAdmin = ['admin', 'super-admin', 'finance'].includes(session.role);
    if (!isOwner && !isAdmin) {
      if (isDirectBrowserNav) {
        return Response.redirect(new URL('/account', request.url), 302);
      }
      return fail('You cannot view this invoice.', 403);
    }

    let invoice = await Invoice.findOne({ orderId: id }).lean();
    const isCorrupt = invoice && (
      Math.abs(invoice.roundOff || 0) > 5 ||
      Math.abs((invoice.taxableAmount || 0) + (invoice.totalTax || 0) + (invoice.roundOff || 0) - (invoice.totalAmount || 0)) > 2
    );
    if (!invoice || isCorrupt || url.searchParams.get('regenerate') === '1') {
      invoice = await generateInvoiceForOrder(id, { actor: session, regenerate: true });
    }

    const pdfBuffer = await generateInvoicePdfBuffer(invoice);
    const cleanNumber = (invoice.invoiceNumber || 'INV').replace(/[\/\\?%*:|"<>]/g, '_');
    const filename = `Invoice_${cleanNumber}.pdf`;

    // Strict security: Default to 'attachment' so the browser downloads in the background
    // and never renders as a standalone web URL tab. Only allow 'inline' inside admin iframe preview.
    const allowInline = url.searchParams.get('inline') === '1' && isAdmin;
    const dispositionType = allowInline ? 'inline' : 'attachment';

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Invoice PDF error:', error);
    return fail(error.message || 'Unable to generate invoice PDF.', 400);
  }
}
