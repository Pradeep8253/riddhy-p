import { connectDB } from '@/lib/db';
import { Order, Invoice } from '@/models/index';
import { getSession } from '@/lib/auth';
import { fail } from '@/lib/http';
import { generateInvoiceForOrder } from '@/lib/invoice-generator';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';

export async function GET(_request, { params }) {
  const session = await getSession();
  if (!session) return fail('Sign in to view this invoice.', 401);

  const { id } = await params;

  try {
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return fail('Order not found.', 404);

    const isOwner = String(order.userId) === String(session.sub) || (order.phone && order.phone === session.phone);
    const isAdmin = ['admin', 'super-admin', 'finance'].includes(session.role);
    if (!isOwner && !isAdmin) {
      return fail('You cannot view this invoice.', 403);
    }

    let invoice = await Invoice.findOne({ orderId: id }).lean();
    if (!invoice) {
      invoice = await generateInvoiceForOrder(id);
    }

    const pdfBuffer = await generateInvoicePdfBuffer(invoice);
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber.replace(/\//g, '-')}.pdf"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Invoice PDF error:', error);
    return fail('Unable to generate invoice PDF.', 500);
  }
}
