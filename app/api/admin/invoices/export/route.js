import ExcelJS from 'exceljs';
import { connectDB } from '@/lib/db';
import { Invoice, CreditNote } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { fail, apiError } from '@/lib/http';

export const dynamic = 'force-dynamic';

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    if (/^[=+\-@]/.test(val)) return `'${val}`;
    return val;
  }
  return val;
}

export async function GET(request) {
  const actor = await requireAdmin(new Set(['super-admin', 'admin', 'finance']));
  if (!actor) {
    return fail('Admin permission required.', 403);
  }

  try {
    await connectDB();
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx'; // 'xlsx' | 'csv'
    const section = url.searchParams.get('section') || 'all'; // 'b2b' | 'b2cs' | 'b2cl' | 'hsn' | 'cdnr' | 'tally' | 'monthly' | 'all'
    const financialYear = url.searchParams.get('financialYear');

    const filter = { status: { $ne: 'void' } };
    if (financialYear && financialYear !== 'all') {
      filter.financialYear = financialYear;
    }

    const [invoices, creditNotes] = await Promise.all([
      Invoice.find(filter).sort({ invoiceDate: -1, sequenceNumber: -1 }).lean(),
      CreditNote.find({
        ...(financialYear && financialYear !== 'all' ? { financialYear } : {}),
        status: { $ne: 'void' }
      }).sort({ issuedAt: -1, sequenceNumber: -1 }).lean()
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RF Riddhy Financial Accounting';
    workbook.created = new Date();

    const headerStyle = {
      font: { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4D35' } },
      alignment: { vertical: 'middle' },
      height: 24
    };

    // SHEET 1: Master Invoices Register
    const masterSheet = workbook.addWorksheet('Master Invoices');
    masterSheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 22 },
      { header: 'Invoice Date', key: 'invoiceDate', width: 14 },
      { header: 'Order Number', key: 'orderNumber', width: 18 },
      { header: 'Party / Recipient', key: 'buyerName', width: 24 },
      { header: 'GSTIN / UIN', key: 'buyerGstin', width: 18 },
      { header: 'B2B/B2C', key: 'partyType', width: 12 },
      { header: 'Place of Supply', key: 'placeOfSupply', width: 18 },
      { header: 'Inter-State', key: 'isInterState', width: 12 },
      { header: 'Taxable Value', key: 'taxableAmount', width: 16 },
      { header: 'CGST', key: 'cgstTotal', width: 14 },
      { header: 'SGST', key: 'sgstTotal', width: 14 },
      { header: 'IGST', key: 'igstTotal', width: 14 },
      { header: 'Total Tax', key: 'totalTax', width: 14 },
      { header: 'Invoice Total', key: 'totalAmount', width: 16 },
      { header: 'Payment Status', key: 'paymentStatus', width: 14 },
      { header: 'Payment Mode', key: 'paymentMode', width: 14 }
    ];
    Object.assign(masterSheet.getRow(1), headerStyle);

    invoices.forEach((inv) => {
      const isB2B = Boolean(inv.buyer?.isB2B || (inv.buyer?.gstin && inv.buyer.gstin.length >= 15));
      const row = masterSheet.addRow({
        invoiceNumber: sanitizeCell(inv.invoiceNumber),
        invoiceDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
        orderNumber: sanitizeCell(inv.orderNumber),
        buyerName: sanitizeCell(isB2B ? (inv.buyer?.businessName || inv.buyer?.name) : inv.buyer?.name),
        buyerGstin: sanitizeCell(inv.buyer?.gstin || 'URP'),
        partyType: isB2B ? 'B2B' : 'B2C',
        placeOfSupply: sanitizeCell(inv.placeOfSupply),
        isInterState: inv.isInterState ? 'Yes' : 'No',
        taxableAmount: Number(inv.taxableAmount || 0),
        cgstTotal: Number(inv.cgstTotal || 0),
        sgstTotal: Number(inv.sgstTotal || 0),
        igstTotal: Number(inv.igstTotal || 0),
        totalTax: Number(inv.totalTax || 0),
        totalAmount: Number(inv.totalAmount || 0),
        paymentStatus: sanitizeCell((inv.paymentStatus || 'paid').toUpperCase()),
        paymentMode: sanitizeCell((inv.paymentMode || 'online').toUpperCase())
      });

      ['taxableAmount', 'cgstTotal', 'sgstTotal', 'igstTotal', 'totalTax', 'totalAmount'].forEach((col) => {
        row.getCell(col).numFmt = '#,##0.00';
      });
    });

    // SHEET 2: GSTR-1 Table 4 (B2B Invoices)
    const b2bSheet = workbook.addWorksheet('GSTR-1 B2B (Table 4)');
    b2bSheet.columns = [
      { header: 'GSTIN/UIN of Recipient', key: 'gstin', width: 20 },
      { header: 'Receiver Name', key: 'name', width: 24 },
      { header: 'Invoice Number', key: 'invNo', width: 20 },
      { header: 'Invoice date', key: 'invDate', width: 14 },
      { header: 'Invoice Value', key: 'invValue', width: 16 },
      { header: 'Place Of Supply', key: 'pos', width: 18 },
      { header: 'Reverse Charge', key: 'revCharge', width: 14 },
      { header: 'Applicable % of Tax Rate', key: 'taxRate', width: 14 },
      { header: 'Rate', key: 'rate', width: 10 },
      { header: 'Taxable Value', key: 'taxable', width: 16 },
      { header: 'Cess Amount', key: 'cess', width: 12 }
    ];
    Object.assign(b2bSheet.getRow(1), headerStyle);

    invoices.filter((inv) => inv.buyer?.isB2B || (inv.buyer?.gstin && inv.buyer.gstin.length >= 15)).forEach((inv) => {
      // Group by rate within invoice
      const rateMap = new Map();
      (inv.items || []).forEach((item) => {
        const r = item.gstRate || 18;
        rateMap.set(r, (rateMap.get(r) || 0) + (item.taxableValue || 0));
      });
      if (inv.deliveryFee > 0) rateMap.set(18, (rateMap.get(18) || 0) + (inv.deliveryTaxable || Math.round(inv.deliveryFee / 1.18)));
      if (inv.installationFee > 0) rateMap.set(18, (rateMap.get(18) || 0) + (inv.installationTaxable || Math.round(inv.installationFee / 1.18)));

      rateMap.forEach((taxable, r) => {
        const row = b2bSheet.addRow({
          gstin: sanitizeCell(inv.buyer.gstin),
          name: sanitizeCell(inv.buyer.businessName || inv.buyer.name),
          invNo: sanitizeCell(inv.invoiceNumber),
          invDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
          invValue: Number(inv.totalAmount || 0),
          pos: `${inv.buyer.stateCode || '07'}-${sanitizeCell(inv.placeOfSupply)}`,
          revCharge: 'N',
          taxRate: '',
          rate: r,
          taxable: Math.round(taxable * 100) / 100,
          cess: 0
        });
        row.getCell('invValue').numFmt = '#,##0.00';
        row.getCell('taxable').numFmt = '#,##0.00';
      });
    });

    // SHEET 3: GSTR-1 Table 7 (B2C Small)
    const b2csSheet = workbook.addWorksheet('GSTR-1 B2CS (Table 7)');
    b2csSheet.columns = [
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Place Of Supply', key: 'pos', width: 20 },
      { header: 'Applicable % of Tax Rate', key: 'appRate', width: 14 },
      { header: 'Rate', key: 'rate', width: 10 },
      { header: 'Taxable Value', key: 'taxable', width: 18 },
      { header: 'Cess Amount', key: 'cess', width: 12 },
      { header: 'E-Commerce GSTIN', key: 'ecom', width: 18 }
    ];
    Object.assign(b2csSheet.getRow(1), headerStyle);

    // Aggregate B2CS by POS and Rate
    const b2csAgg = new Map();
    invoices.filter((inv) => !inv.buyer?.isB2B && (!inv.buyer?.gstin || inv.buyer.gstin.length < 15)).forEach((inv) => {
      const pos = `${inv.buyer?.stateCode || '07'}-${inv.placeOfSupply || 'Delhi'}`;
      (inv.items || []).forEach((item) => {
        const r = item.gstRate || 18;
        const key = `${pos}_${r}`;
        b2csAgg.set(key, (b2csAgg.get(key) || 0) + (item.taxableValue || 0));
      });
    });

    b2csAgg.forEach((taxable, key) => {
      const [pos, r] = key.split('_');
      const row = b2csSheet.addRow({
        type: 'OE',
        pos,
        appRate: '',
        rate: Number(r),
        taxable: Math.round(taxable * 100) / 100,
        cess: 0,
        ecom: ''
      });
      row.getCell('taxable').numFmt = '#,##0.00';
    });

    // SHEET 4: GSTR-1 Table 12 (HSN Summary)
    const hsnSheet = workbook.addWorksheet('GSTR-1 HSN (Table 12)');
    hsnSheet.columns = [
      { header: 'HSN', key: 'hsn', width: 14 },
      { header: 'Description', key: 'desc', width: 28 },
      { header: 'UQC', key: 'uqc', width: 10 },
      { header: 'Total Quantity', key: 'qty', width: 14 },
      { header: 'Total Value', key: 'totalVal', width: 16 },
      { header: 'Taxable Value', key: 'taxable', width: 16 },
      { header: 'Integrated Tax Amount', key: 'igst', width: 16 },
      { header: 'Central Tax Amount', key: 'cgst', width: 16 },
      { header: 'State/UT Tax Amount', key: 'sgst', width: 16 },
      { header: 'Cess Amount', key: 'cess', width: 12 }
    ];
    Object.assign(hsnSheet.getRow(1), headerStyle);

    const hsnMaster = new Map();
    invoices.forEach((inv) => {
      (inv.hsnSummary || []).forEach((h) => {
        const cur = hsnMaster.get(h.hsn) || {
          hsn: h.hsn,
          desc: h.description || 'Goods / Services',
          qty: 0,
          totalVal: 0,
          taxable: 0,
          igst: 0,
          cgst: 0,
          sgst: 0
        };
        cur.taxable += h.taxableValue || 0;
        cur.igst += h.igstAmount || 0;
        cur.cgst += h.cgstAmount || 0;
        cur.sgst += h.sgstAmount || 0;
        cur.totalVal += (h.taxableValue || 0) + (h.totalTax || 0);
        hsnMaster.set(h.hsn, cur);
      });
    });

    hsnMaster.forEach((h) => {
      const row = hsnSheet.addRow({
        hsn: h.hsn,
        desc: h.desc,
        uqc: 'NOS',
        qty: 1,
        totalVal: Math.round(h.totalVal * 100) / 100,
        taxable: Math.round(h.taxable * 100) / 100,
        igst: Math.round(h.igst * 100) / 100,
        cgst: Math.round(h.cgst * 100) / 100,
        sgst: Math.round(h.sgst * 100) / 100,
        cess: 0
      });
      ['totalVal', 'taxable', 'igst', 'cgst', 'sgst'].forEach((col) => {
        row.getCell(col).numFmt = '#,##0.00';
      });
    });

    // SHEET 5: Credit Notes (GSTR-1 CDNR Table 9B)
    const cnSheet = workbook.addWorksheet('Credit Notes (Table 9B)');
    cnSheet.columns = [
      { header: 'Credit Note No', key: 'cnNo', width: 22 },
      { header: 'Date of Issue', key: 'cnDate', width: 14 },
      { header: 'Original Invoice No', key: 'invNo', width: 22 },
      { header: 'Original Invoice Date', key: 'invDate', width: 14 },
      { header: 'Receiver Name', key: 'name', width: 22 },
      { header: 'Receiver GSTIN', key: 'gstin', width: 18 },
      { header: 'Taxable Reversed', key: 'taxable', width: 16 },
      { header: 'CGST Reversed', key: 'cgst', width: 14 },
      { header: 'SGST Reversed', key: 'sgst', width: 14 },
      { header: 'IGST Reversed', key: 'igst', width: 14 },
      { header: 'Total Credit Amount', key: 'amount', width: 16 },
      { header: 'Reason', key: 'reason', width: 26 }
    ];
    Object.assign(cnSheet.getRow(1), headerStyle);

    creditNotes.forEach((cn) => {
      const row = cnSheet.addRow({
        cnNo: sanitizeCell(cn.creditNoteNumber),
        cnDate: new Date(cn.issuedAt).toLocaleDateString('en-IN'),
        invNo: sanitizeCell(cn.invoiceNumber),
        invDate: cn.invoiceDate ? new Date(cn.invoiceDate).toLocaleDateString('en-IN') : '',
        name: sanitizeCell(cn.buyer?.name || 'Customer'),
        gstin: sanitizeCell(cn.buyer?.gstin || 'URP'),
        taxable: Number(cn.taxableAmount || 0),
        cgst: Number(cn.cgstAmount || 0),
        sgst: Number(cn.sgstAmount || 0),
        igst: Number(cn.igstAmount || 0),
        amount: Number(cn.amount || 0),
        reason: sanitizeCell(cn.reason || 'Refund')
      });
      ['taxable', 'cgst', 'sgst', 'igst', 'amount'].forEach((col) => {
        row.getCell(col).numFmt = '#,##0.00';
      });
    });

    // SHEET 6: Tally Import Compatible Format
    const tallySheet = workbook.addWorksheet('Tally Import Format');
    tallySheet.columns = [
      { header: 'Vch Date', key: 'vchDate', width: 12 },
      { header: 'Vch Type', key: 'vchType', width: 12 },
      { header: 'Vch No', key: 'vchNo', width: 20 },
      { header: 'Party Name', key: 'party', width: 24 },
      { header: 'GSTIN', key: 'gstin', width: 18 },
      { header: 'State of Supply', key: 'state', width: 16 },
      { header: 'Sales (Taxable)', key: 'sales', width: 16 },
      { header: 'Output CGST', key: 'cgst', width: 14 },
      { header: 'Output SGST', key: 'sgst', width: 14 },
      { header: 'Output IGST', key: 'igst', width: 14 },
      { header: 'Round Off', key: 'roundOff', width: 12 },
      { header: 'Gross Bill Amount', key: 'gross', width: 16 }
    ];
    Object.assign(tallySheet.getRow(1), headerStyle);

    invoices.forEach((inv) => {
      const row = tallySheet.addRow({
        vchDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
        vchType: 'Sales',
        vchNo: sanitizeCell(inv.invoiceNumber),
        party: sanitizeCell(inv.buyer?.isB2B ? (inv.buyer.businessName || inv.buyer.name) : (inv.buyer?.name || 'Cash Customer')),
        gstin: sanitizeCell(inv.buyer?.gstin || ''),
        state: sanitizeCell(inv.placeOfSupply),
        sales: Number(inv.taxableAmount || 0),
        cgst: Number(inv.cgstTotal || 0),
        sgst: Number(inv.sgstTotal || 0),
        igst: Number(inv.igstTotal || 0),
        roundOff: Number(inv.roundOff || 0),
        gross: Number(inv.totalAmount || 0)
      });
      ['sales', 'cgst', 'sgst', 'igst', 'roundOff', 'gross'].forEach((col) => {
        row.getCell(col).numFmt = '#,##0.00';
      });
    });

    // CSV format handling for single section requests
    if (format === 'csv') {
      let targetWorksheet = masterSheet;
      let filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;

      if (section === 'b2b') {
        targetWorksheet = b2bSheet;
        filename = `gstr1-b2b-${new Date().toISOString().slice(0, 10)}.csv`;
      } else if (section === 'b2cs') {
        targetWorksheet = b2csSheet;
        filename = `gstr1-b2cs-${new Date().toISOString().slice(0, 10)}.csv`;
      } else if (section === 'hsn') {
        targetWorksheet = hsnSheet;
        filename = `gstr1-hsn-${new Date().toISOString().slice(0, 10)}.csv`;
      } else if (section === 'cdnr') {
        targetWorksheet = cnSheet;
        filename = `gstr1-cdnr-${new Date().toISOString().slice(0, 10)}.csv`;
      } else if (section === 'tally') {
        targetWorksheet = tallySheet;
        filename = `tally-sales-${new Date().toISOString().slice(0, 10)}.csv`;
      }

      // Create single-sheet temporary workbook for CSV
      const csvWb = new ExcelJS.Workbook();
      const clonedSheet = csvWb.addWorksheet(targetWorksheet.name);
      targetWorksheet.eachRow((row, rowNum) => {
        clonedSheet.addRow(row.values);
      });

      const csvBuffer = await csvWb.csv.writeBuffer();
      return new Response(csvBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Default multi-sheet Excel workbook export
    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    return new Response(xlsxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="RF-Riddhy-GSTR1-Invoices-${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
