import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { fail, apiError } from '@/lib/http';

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    if (/^[=+\-@]/.test(val)) return `'${val}`;
    return val;
  }
  return val;
}

export async function GET(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'finance', 'warehouse']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('paymentStatus');

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RF Riddhy CRM Operations';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 18 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 22 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Items Count', key: 'itemsCount', width: 12 },
      { header: 'Order Total (₹)', key: 'total', width: 16 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Payment Status', key: 'paymentStatus', width: 16 },
      { header: 'Order Status', key: 'status', width: 18 },
      { header: 'Invoice Number', key: 'invoiceNumber', width: 22 }
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1B5E20' } // Brand Forest Green
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    orders.forEach((o) => {
      const row = sheet.addRow({
        orderNumber: sanitizeCell(o.orderNumber),
        date: new Date(o.createdAt).toLocaleDateString('en-IN'),
        customerName: sanitizeCell(o.shippingAddress?.name || o.billingAddress?.name || 'Customer'),
        phone: sanitizeCell(o.phone || o.shippingAddress?.phone || ''),
        city: sanitizeCell(o.shippingAddress?.city || ''),
        state: sanitizeCell(o.shippingAddress?.state || ''),
        itemsCount: o.items?.length || 1,
        total: Number(o.total || 0),
        paymentMethod: (o.paymentMethod || 'online').toUpperCase(),
        paymentStatus: (o.paymentStatus || 'unpaid').toUpperCase(),
        status: (o.status || 'draft').replace(/_/g, ' ').toUpperCase(),
        invoiceNumber: sanitizeCell(o.invoiceNumber || 'Pending')
      });

      row.getCell('total').numFmt = '₹#,##0.00';
    });

    if (format === 'csv') {
      const csvBuffer = await workbook.csv.writeBuffer();
      return new Response(csvBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    return new Response(xlsxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
