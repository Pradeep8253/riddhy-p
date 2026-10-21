import ExcelJS from 'exceljs';
import { connectDB } from '@/lib/db';
import { ProductRegistration, WarrantyClaim } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { fail, apiError } from '@/lib/http';
import { daysRemaining } from '@/lib/warranty';
import { formatDateDDMMYYYY } from '@/lib/date-utils';

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    if (/^[=+\-@]/.test(val)) return `'${val}`;
    return val;
  }
  return val;
}

export async function GET(request) {
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'support']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';

    const [regs, claims] = await Promise.all([
      ProductRegistration.find({}).sort({ createdAt: -1 }).lean(),
      WarrantyClaim.find({}).sort({ createdAt: -1 }).lean()
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RF Riddhy Warranty Care Desk';
    workbook.created = new Date();

    // Sheet 1: Product Registrations
    const regSheet = workbook.addWorksheet('Registrations');
    regSheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 18 },
      { header: 'SKU', key: 'sku', width: 16 },
      { header: 'Product Name', key: 'productName', width: 24 },
      { header: 'Unit Index', key: 'unitIndex', width: 12 },
      { header: 'Serial Number', key: 'serialNumber', width: 18 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Phone', key: 'customerPhone', width: 16 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
      { header: 'Expiry Date', key: 'expiryDate', width: 15 },
      { header: 'Days Left', key: 'daysLeft', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Verified', key: 'verified', width: 12 },
      { header: 'Source', key: 'registeredFrom', width: 14 }
    ];

    const hRow = regSheet.getRow(1);
    hRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
    hRow.height = 24;
    regSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    regs.forEach((r) => {
      regSheet.addRow({
        orderNumber: sanitizeCell(r.orderNumber),
        sku: sanitizeCell(r.sku),
        productName: sanitizeCell(r.productName),
        unitIndex: r.unitIndex ?? 0,
        serialNumber: sanitizeCell(r.serialNumber || 'N/A'),
        customerName: sanitizeCell(r.customerName),
        customerPhone: sanitizeCell(r.customerPhone),
        purchaseDate: formatDateDDMMYYYY(r.purchaseDate),
        expiryDate: formatDateDDMMYYYY(r.expiryDate),
        daysLeft: daysRemaining(r.expiryDate),
        status: (r.status || 'active').toUpperCase(),
        verified: r.verified ? 'YES' : 'NO',
        registeredFrom: (r.registeredFrom || 'order').toUpperCase()
      });
    });

    // Sheet 2: Service Claims
    const claimSheet = workbook.addWorksheet('Service Claims');
    claimSheet.columns = [
      { header: 'Claim Number', key: 'claimNumber', width: 18 },
      { header: 'Created Date', key: 'date', width: 15 },
      { header: 'Issue Description', key: 'issue', width: 32 },
      { header: 'Preferred Contact', key: 'contact', width: 16 },
      { header: 'Assigned To', key: 'assignedTo', width: 22 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const cRow = claimSheet.getRow(1);
    cRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };

    claims.forEach((c) => {
      claimSheet.addRow({
        claimNumber: sanitizeCell(c.claimNumber || String(c._id).slice(-8)),
        date: formatDateDDMMYYYY(c.createdAt),
        issue: sanitizeCell(c.issue),
        contact: sanitizeCell(c.preferredContact),
        assignedTo: sanitizeCell(c.assignedToEmail || 'Unassigned'),
        status: (c.status || 'submitted').toUpperCase()
      });
    });

    if (format === 'csv') {
      const csvBuffer = await workbook.csv.writeBuffer();
      return new Response(csvBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="warranties-${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    return new Response(xlsxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="warranties-${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
