import ExcelJS from 'exceljs';
import { connectDB } from '@/lib/db';
import { Product, Variant, Category, Warehouse, Inventory, StockMovement, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail } from '@/lib/http';
import { revalidateTag } from 'next/cache';

const REQUIRED_HEADERS = ['sku', 'name', 'category', 'type', 'price'];

export async function GET() {
  // Downloadable XLSX sample template
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products Template');

  sheet.columns = [
    { header: 'SKU *', key: 'sku', width: 16 },
    { header: 'Product Name *', key: 'name', width: 32 },
    { header: 'Category *', key: 'category', width: 18 },
    { header: 'Type *', key: 'type', width: 14 },
    { header: 'Brand', key: 'brand', width: 16 },
    { header: 'Selling Price (₹) *', key: 'price', width: 18 },
    { header: 'MRP (₹) *', key: 'mrp', width: 18 },
    { header: 'Stock Units *', key: 'stock', width: 14 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Tags', key: 'tags', width: 22 }
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5F2E' } };

  sheet.addRow({
    sku: 'RF-SOFA-EX01',
    name: 'Nordic 3-Seater Comfort Sofa',
    category: 'sofas',
    type: 'furniture',
    brand: 'RF Riddhy',
    price: 34990,
    mrp: 44990,
    stock: 12,
    description: 'High-density foam cushioning with solid sheesham frame',
    status: 'active',
    tags: 'best-selling, new-arrival'
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="product-import-template.xlsx"'
    }
  });
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const isDryRun = url.searchParams.get('dryRun') !== 'false';

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return fail('Please upload a valid CSV or XLSX spreadsheet.', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || 'import.xlsx';
    const isCsv = filename.endsWith('.csv') || file.type.includes('csv');

    await connectDB();

    // Read active categories for validation
    const categories = await Category.find({ active: true }).lean();
    const validCategorySlugs = new Set(categories.map((c) => c.slug));

    const workbook = new ExcelJS.Workbook();
    if (isCsv) {
      const stream = new (await import('stream')).Readable();
      stream.push(buffer);
      stream.push(null);
      await workbook.csv.read(stream);
    } else {
      await workbook.xlsx.load(buffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return fail('Spreadsheet contains no sheets.', 400);

    const headers = [];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      headers[colNumber] = val;
    });

    const parsedRows = [];
    const rowErrors = [];
    const seenSkusInFile = new Set();

    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const h = headers[colNumber];
        if (h) {
          rowData[h] = typeof cell.value === 'object' && cell.value?.text ? cell.value.text : cell.value;
        }
      });

      // Normalize fields
      const sku = String(rowData.sku || '').trim().toUpperCase();
      const name = String(rowData.name || rowData.productname || '').trim();
      const category = String(rowData.category || '').trim().toLowerCase();
      const type = String(rowData.type || 'furniture').trim().toLowerCase();
      const price = Number(rowData.price || rowData.sellingprice || 0);
      const mrp = Number(rowData.mrp || price || 0);
      const stock = Number(rowData.stock || rowData.units || 0);
      const brand = String(rowData.brand || 'RF Riddhy').trim();
      const status = String(rowData.status || 'draft').trim().toLowerCase();
      const tags = String(rowData.tags || '')
        .split(/[,;]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const errors = [];
      const warnings = [];

      if (!sku) errors.push('Missing SKU');
      else if (seenSkusInFile.has(sku)) errors.push(`Duplicate SKU in file: ${sku}`);
      else seenSkusInFile.add(sku);

      if (!name) errors.push('Missing product name');
      if (!price || price <= 0) errors.push('Selling price must be greater than 0');
      if (mrp < price) errors.push(`MRP (₹${mrp}) is lower than selling price (₹${price})`);
      if (stock < 0) errors.push('Stock cannot be negative');

      if (!category) {
        errors.push('Missing category slug');
      } else if (!validCategorySlugs.has(category)) {
        warnings.push(`Category "${category}" is not an existing active category`);
      }

      const rowStatus = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';
      if (rowStatus === 'valid') validCount++;
      else if (rowStatus === 'warning') warningCount++;
      else errorCount++;

      const normalized = {
        rowNumber,
        sku,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        type: type === 'appliance' ? 'appliance' : 'furniture',
        brand,
        price,
        mrp,
        stock,
        status: ['draft', 'active', 'archived'].includes(status) ? status : 'draft',
        tags,
        description: String(rowData.description || ''),
        statusTag: rowStatus,
        errors,
        warnings
      };

      parsedRows.push(normalized);
    });

    // If dry run, return preview verification
    if (isDryRun) {
      return ok({
        dryRun: true,
        summary: {
          totalRows: parsedRows.length,
          validCount,
          warningCount,
          errorCount
        },
        rows: parsedRows.slice(0, 100) // return first 100 rows preview
      });
    }

    // Execute bulk upsert for all valid & warning rows
    const executableRows = parsedRows.filter((r) => r.statusTag !== 'error');
    if (executableRows.length === 0) {
      return fail('No valid rows available to import.', 400);
    }

    const warehouseCode = process.env.DEFAULT_WAREHOUSE_CODE || 'DELHI-01';
    const warehouse = await Warehouse.findOneAndUpdate(
      { code: warehouseCode },
      { $setOnInsert: { code: warehouseCode, name: 'Default Hub', active: true } },
      { upsert: true, new: true }
    );

    let importedCount = 0;
    for (const r of executableRows) {
      const cat = categories.find((c) => c.slug === r.category);
      const product = await Product.findOneAndUpdate(
        { slug: r.slug },
        {
          $set: {
            name: r.name,
            slug: r.slug,
            category: r.category,
            categoryId: cat?._id,
            categoryLabel: cat?.name || r.category,
            type: r.type,
            brand: r.brand,
            price: r.price,
            mrp: r.mrp,
            discount: r.mrp > r.price ? Math.round(((r.mrp - r.price) / r.mrp) * 100) : 0,
            stock: r.stock,
            status: r.status,
            tags: r.tags,
            description: r.description,
            isDemo: false
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const variant = await Variant.findOneAndUpdate(
        { sku: r.sku },
        {
          $set: {
            productId: product._id,
            sku: r.sku,
            price: r.price,
            mrp: r.mrp,
            stock: r.stock,
            active: r.status === 'active'
          }
        },
        { upsert: true, new: true }
      );

      await Inventory.findOneAndUpdate(
        { variantId: variant._id, warehouseId: warehouse._id },
        { $set: { available: r.stock } },
        { upsert: true }
      );

      importedCount++;
    }

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'product.import_bulk',
      entity: 'Product',
      after: { importedCount, totalInFile: parsedRows.length }
    });

    revalidateTag('catalogue', 'max');

    return ok({
      dryRun: false,
      message: `Successfully imported and upserted ${importedCount} products.`,
      importedCount
    });
  } catch (error) {
    console.error('Import processing error:', error);
    return fail(error.message, 500);
  }
}
