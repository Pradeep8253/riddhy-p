import ExcelJS from 'exceljs';
import { PassThrough } from 'stream';
import { connectDB } from '@/lib/db';
import { Product, Variant } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { fail } from '@/lib/http';

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing', 'warehouse', 'finance']));
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const format = searchParams.get('format') === 'csv' ? 'csv' : 'xlsx';
  const scope = searchParams.get('scope') || 'filtered'; // 'filtered' | 'selected' | 'all'
  const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean);

  const q = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const stockFilter = searchParams.get('stock');
  const tag = searchParams.get('tag');

  await connectDB();

  // Build filter
  let filter = {};
  if (scope === 'selected' && selectedIds.length > 0) {
    filter = { _id: { $in: selectedIds } };
  } else if (scope !== 'all') {
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (tag && tag !== 'all') filter.tags = tag;

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { brand: regex },
        { category: regex },
        { tags: regex }
      ];
    }
  }

  // Pipeline joining Variant to fetch SKU, effective price, stock
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'variants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants'
      }
    },
    {
      $addFields: {
        sku: { $ifNull: [{ $arrayElemAt: ['$variants.sku', 0] }, ''] },
        effectivePrice: { $ifNull: [{ $arrayElemAt: ['$variants.price', 0] }, '$price'] },
        effectiveMrp: { $ifNull: [{ $arrayElemAt: ['$variants.mrp', 0] }, '$mrp'] },
        effectiveStock: { $ifNull: [{ $arrayElemAt: ['$variants.stock', 0] }, 0] }
      }
    }
  ];

  if (stockFilter === 'in') {
    pipeline.push({ $match: { effectiveStock: { $gt: 5 } } });
  } else if (stockFilter === 'low') {
    pipeline.push({ $match: { effectiveStock: { $gt: 0, $lte: 5 } } });
  } else if (stockFilter === 'out') {
    pipeline.push({ $match: { effectiveStock: { $lte: 0 } } });
  }

  pipeline.push({ $sort: { updatedAt: -1 } });

  const products = await Product.aggregate(pipeline);

  // If CSV export format
  if (format === 'csv') {
    const headers = [
      'SKU',
      'Name',
      'Category',
      'Type',
      'Brand',
      'Selling Price (INR)',
      'MRP (INR)',
      'Discount (%)',
      'Stock Units',
      'Status',
      'Tags',
      'HSN Code',
      'Created At'
    ];

    const escapeCsv = (str) => `"${String(str ?? '').replace(/"/g, '""')}"`;

    const rows = [
      headers.map(escapeCsv).join(','),
      ...products.map((p) =>
        [
          sanitizeCell(p.sku),
          sanitizeCell(p.name),
          sanitizeCell(p.categoryLabel || p.category),
          sanitizeCell(p.type),
          sanitizeCell(p.brand || 'RF Riddhy'),
          p.effectivePrice ?? p.price,
          p.effectiveMrp ?? p.mrp,
          p.discount || 0,
          p.effectiveStock ?? 0,
          p.status,
          (p.tags || []).join('; '),
          p.hsnCode || '9403',
          new Date(p.createdAt).toISOString().slice(0, 10)
        ]
          .map(escapeCsv)
          .join(',')
      )
    ];

    const csvContent = '\uFEFF' + rows.join('\r\n');
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="catalogue-export-${Date.now()}.csv"`
      }
    });
  }

  // Real Excel (.xlsx) using ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RF Riddhy Enterprise CRM';
  workbook.created = new Date();

  // 1. SHEET: Products
  const sheet = workbook.addWorksheet('Products', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 18 },
    { header: 'Product Name', key: 'name', width: 36 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Brand', key: 'brand', width: 16 },
    { header: 'Selling Price (₹)', key: 'price', width: 18, style: { numFmt: '₹#,##0' } },
    { header: 'MRP (₹)', key: 'mrp', width: 18, style: { numFmt: '₹#,##0' } },
    { header: 'Discount %', key: 'discount', width: 14 },
    { header: 'Stock Units', key: 'stock', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Tags', key: 'tags', width: 24 },
    { header: 'HSN Code', key: 'hsn', width: 12 },
    { header: 'Created Date', key: 'createdAt', width: 16, style: { numFmt: 'dd-mmm-yyyy' } }
  ];

  // Style header row in Brand Forest Green (#1F5F2E)
  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F5F2E' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  let totalStockVal = 0;
  let totalUnits = 0;
  const catCount = {};
  const statusCount = { active: 0, draft: 0, archived: 0 };

  products.forEach((p) => {
    const sPrice = p.effectivePrice ?? p.price ?? 0;
    const sUnits = p.effectiveStock ?? 0;
    totalStockVal += sPrice * sUnits;
    totalUnits += sUnits;

    catCount[p.category] = (catCount[p.category] || 0) + 1;
    if (statusCount[p.status] !== undefined) statusCount[p.status]++;

    const row = sheet.addRow({
      sku: sanitizeCell(p.sku),
      name: sanitizeCell(p.name),
      category: sanitizeCell(p.categoryLabel || p.category),
      type: sanitizeCell(p.type),
      brand: sanitizeCell(p.brand || 'RF Riddhy'),
      price: sPrice,
      mrp: p.effectiveMrp ?? p.mrp ?? sPrice,
      discount: p.discount || 0,
      stock: sUnits,
      status: p.status,
      tags: sanitizeCell((p.tags || []).join(', ')),
      hsn: sanitizeCell(p.hsnCode || '9403'),
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
    });

    // Highlight low/out of stock
    if (sUnits <= 0) {
      row.getCell('stock').font = { color: { argb: 'FFDC2626' }, bold: true };
    } else if (sUnits <= 5) {
      row.getCell('stock').font = { color: { argb: 'FFD97706' }, bold: true };
    }
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length }
  };

  // 2. SHEET: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 25 }
  ];

  const sHeader = summarySheet.getRow(1);
  sHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5F2E' } };

  summarySheet.addRow({ metric: 'Total Exported Products', value: products.length });
  summarySheet.addRow({ metric: 'Total Stock Available (Units)', value: totalUnits });
  summarySheet.addRow({ metric: 'Total Stock Valuation (₹)', value: totalStockVal });
  summarySheet.addRow({ metric: 'Active Products', value: statusCount.active });
  summarySheet.addRow({ metric: 'Draft Products', value: statusCount.draft });
  summarySheet.addRow({ metric: 'Archived Products', value: statusCount.archived });

  summarySheet.addRow({});
  summarySheet.addRow({ metric: '--- Category Breakdown ---', value: '' });
  Object.entries(catCount).forEach(([cat, cnt]) => {
    summarySheet.addRow({ metric: cat, value: cnt });
  });

  // 3. SHEET: Filters Applied
  const filterSheet = workbook.addWorksheet('Filters Applied');
  filterSheet.columns = [
    { header: 'Parameter', key: 'param', width: 25 },
    { header: 'Value', key: 'val', width: 40 }
  ];
  const fHeader = filterSheet.getRow(1);
  fHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  fHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5F2E' } };

  filterSheet.addRow({ param: 'Export Date (Asia/Kolkata)', val: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) });
  filterSheet.addRow({ param: 'Exported By', val: actor.email || 'Admin' });
  filterSheet.addRow({ param: 'Scope', val: scope });
  filterSheet.addRow({ param: 'Search Query (q)', val: q || '(None)' });
  filterSheet.addRow({ param: 'Status Filter', val: status || 'All' });
  filterSheet.addRow({ param: 'Type Filter', val: type || 'All' });
  filterSheet.addRow({ param: 'Category Filter', val: category || 'All' });
  filterSheet.addRow({ param: 'Stock Filter', val: stockFilter || 'All' });
  filterSheet.addRow({ param: 'Tag Filter', val: tag || 'All' });

  // Stream output buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="catalogue-export-${Date.now()}.xlsx"`
    }
  });
}
