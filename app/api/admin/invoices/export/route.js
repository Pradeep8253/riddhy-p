import ExcelJS from 'exceljs';
import { connectDB } from '@/lib/db';
import { Invoice } from '@/models/index';
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
  const auth = await requireAdmin(request, ['super-admin', 'admin', 'finance']);
  if (!auth.authorized) {
    return fail(auth.message || 'Unauthorized', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';
    const financialYear = url.searchParams.get('financialYear');

    const filter = {};
    if (financialYear && financialYear !== 'all') {
      filter.financialYear = financialYear;
    }

    const invoices = await Invoice.find(filter).sort({ invoiceDate: -1, sequenceNumber: -1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RF Riddhy Living Solutions Private Limited';
    workbook.created = new Date();

    // Sheet 1: Invoices
    const sheet = workbook.addWorksheet('GST Invoices');
    sheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 22 },
      { header: 'Invoice Date', key: 'invoiceDate', width: 14 },
      { header: 'Order Number', key: 'orderNumber', width: 18 },
      { header: 'Customer / Recipient', key: 'buyerName', width: 22 },
      { header: 'Customer GSTIN', key: 'buyerGstin', width: 18 },
      { header: 'Place of Supply', key: 'placeOfSupply', width: 18 },
      { header: 'Taxable Amount (₹)', key: 'taxableAmount', width: 18 },
      { header: 'CGST (9%) (₹)', key: 'cgstTotal', width: 15 },
      { header: 'SGST (9%) (₹)', key: 'sgstTotal', width: 15 },
      { header: 'IGST (18%) (₹)', key: 'igstTotal', width: 15 },
      { header: 'Total Tax (₹)', key: 'totalTax', width: 15 },
      { header: 'Invoice Total (₹)', key: 'totalAmount', width: 18 }
    ];

    const hRow = sheet.getRow(1);
    hRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    hRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1B5E20' }
    };
    hRow.height = 24;
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let grandTotal = 0;

    invoices.forEach((inv) => {
      totalTaxable += inv.taxableAmount || 0;
      totalCgst += inv.cgstTotal || 0;
      totalSgst += inv.sgstTotal || 0;
      totalIgst += inv.igstTotal || 0;
      grandTotal += inv.totalAmount || 0;

      const row = sheet.addRow({
        invoiceNumber: sanitizeCell(inv.invoiceNumber),
        invoiceDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
        orderNumber: sanitizeCell(inv.orderNumber),
        buyerName: sanitizeCell(inv.buyer?.name || 'Customer'),
        buyerGstin: sanitizeCell(inv.buyer?.gstin || 'URP'),
        placeOfSupply: sanitizeCell(inv.placeOfSupply || 'West Bengal'),
        taxableAmount: Number(inv.taxableAmount || 0),
        cgstTotal: Number(inv.cgstTotal || 0),
        sgstTotal: Number(inv.sgstTotal || 0),
        igstTotal: Number(inv.igstTotal || 0),
        totalTax: Number(inv.totalTax || 0),
        totalAmount: Number(inv.totalAmount || 0)
      });

      ['taxableAmount', 'cgstTotal', 'sgstTotal', 'igstTotal', 'totalTax', 'totalAmount'].forEach((col) => {
        row.getCell(col).numFmt = '₹#,##0.00';
      });
    });

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('GST Tax Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Total Value (INR)', key: 'val', width: 22 }
    ];

    const sHeader = summarySheet.getRow(1);
    sHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    sHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };

    summarySheet.addRow({ metric: 'Total Invoices Count', val: invoices.length });
    summarySheet.addRow({ metric: 'Cumulative Taxable Value', val: totalTaxable }).getCell('val').numFmt = '₹#,##0.00';
    summarySheet.addRow({ metric: 'Cumulative CGST (Central Tax)', val: totalCgst }).getCell('val').numFmt = '₹#,##0.00';
    summarySheet.addRow({ metric: 'Cumulative SGST (State Tax)', val: totalSgst }).getCell('val').numFmt = '₹#,##0.00';
    summarySheet.addRow({ metric: 'Cumulative IGST (Integrated Tax)', val: totalIgst }).getCell('val').numFmt = '₹#,##0.00';
    summarySheet.addRow({ metric: 'Total GST Collected', val: totalCgst + totalSgst + totalIgst }).getCell('val').numFmt = '₹#,##0.00';
    summarySheet.addRow({ metric: 'Grand Total Revenue', val: grandTotal }).getCell('val').numFmt = '₹#,##0.00';

    if (format === 'csv') {
      const csvBuffer = await workbook.csv.writeBuffer();
      return new Response(csvBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="invoices-gst-${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    return new Response(xlsxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="invoices-gst-${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
