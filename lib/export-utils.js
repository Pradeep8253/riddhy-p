/**
 * Utility functions for exporting data tables in CSV, Excel, Word, and PDF formats.
 * Designed for client-side execution with zero external runtime dependencies.
 */

function sanitizeForFormulaInjection(str) {
  if (typeof str !== 'string') return str;
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Clean and format text for cell output with formula injection prevention.
 */
function formatCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val instanceof Date) return val.toLocaleDateString('en-IN');
    return sanitizeForFormulaInjection(JSON.stringify(val));
  }
  return sanitizeForFormulaInjection(String(val));
}

/**
 * Trigger browser file download with blob.
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 1. Export as CSV (.csv)
 * Includes UTF-8 BOM so Excel and spreadsheet tools render non-ASCII & INR symbols correctly.
 */
export function exportToCsv({ filename = 'export', columns = [], data = [] }) {
  const quote = (str) => `"${String(str ?? '').replace(/"/g, '""')}"`;

  const headerRow = columns.map((col) => quote(col.label || col.key)).join(',');
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const val = typeof col.getValue === 'function' ? col.getValue(row) : row[col.key];
        return quote(formatCell(val));
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

/**
 * 2. Export as Excel (.xls)
 * Uses standard Microsoft Excel HTML Spreadsheet format with styling, fonts, and headers.
 */
export function exportToExcel({ filename = 'export', title = 'Report', columns = [], data = [] }) {
  const now = new Date().toLocaleString('en-IN');

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${title.slice(0, 31)}</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
        .title-row { font-size: 16pt; font-weight: bold; color: #1b2e23; background-color: #f4efe7; padding: 10px; }
        .meta-row { font-size: 9pt; color: #666666; font-style: italic; margin-bottom: 12px; }
        th { background-color: #1b2e23; color: #ffffff; font-weight: bold; border: 1px solid #1b2e23; padding: 8px 12px; text-align: left; }
        td { border: 1px solid #d5dbd6; padding: 6px 10px; font-size: 10pt; }
        .even { background-color: #fbf9f5; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${columns.length}" class="title-row">RF | RIDDHY — ${title}</td></tr>
        <tr><td colspan="${columns.length}" class="meta-row">Generated on: ${now} · RF Riddhy Operations Portal</td></tr>
        <tr>
  `;

  columns.forEach((col) => {
    tableHtml += `<th>${col.label || col.key}</th>`;
  });
  tableHtml += '</tr>';

  data.forEach((row, idx) => {
    tableHtml += `<tr class="${idx % 2 === 0 ? '' : 'even'}">`;
    columns.forEach((col) => {
      const val = typeof col.getValue === 'function' ? col.getValue(row) : row[col.key];
      tableHtml += `<td>${formatCell(val)}</td>`;
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</table></body></html>';

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadFile(blob, `${filename}.xls`);
}

/**
 * 3. Export as Word (.doc)
 * Generates an official formatted Microsoft Word document with headers, metadata and table.
 */
export function exportToWord({ filename = 'export', title = 'Report', columns = [], data = [] }) {
  const now = new Date().toLocaleString('en-IN');

  let docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        @page { size: A4 landscape; margin: 1.5cm; }
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; color: #1e2420; }
        h1 { color: #1b2e23; font-size: 18pt; margin: 0 0 4px 0; border-bottom: 2px solid #2e7d32; padding-bottom: 6px; }
        .meta { color: #6a746b; font-size: 9pt; margin-bottom: 18px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th { background-color: #1b2e23; color: #ffffff; padding: 8px 10px; font-size: 9.5pt; border: 1px solid #1b2e23; text-align: left; }
        td { border: 1px solid #d0d7d2; padding: 6px 10px; font-size: 9pt; }
        tr:nth-child(even) { background-color: #f7f5f0; }
        .footer { margin-top: 25px; font-size: 8.5pt; color: #8a948b; border-top: 1px solid #e0e5e1; padding-top: 8px; text-align: center; }
      </style>
    </head>
    <body>
      <h1>RF | RIDDHY — ${title}</h1>
      <div class="meta">Exported on: ${now} · Total Records: ${data.length} · RF Riddhy Operations Desk</div>
      <table>
        <thead>
          <tr>
  `;

  columns.forEach((col) => {
    docHtml += `<th>${col.label || col.key}</th>`;
  });
  docHtml += '</tr></thead><tbody>';

  data.forEach((row) => {
    docHtml += '<tr>';
    columns.forEach((col) => {
      const val = typeof col.getValue === 'function' ? col.getValue(row) : row[col.key];
      docHtml += `<td>${formatCell(val)}</td>`;
    });
    docHtml += '</tr>';
  });

  docHtml += `
        </tbody>
      </table>
      <div class="footer">RF Riddhy Furniture & Home Appliances · Official Operational Document</div>
    </body>
    </html>
  `;

  const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
  downloadFile(blob, `${filename}.doc`);
}

/**
 * 4. Export as PDF (.pdf)
 * Opens an isolated high-resolution print window styled with RF Riddhy branding and triggers native browser PDF rendering.
 */
export function exportToPdf({ title = 'Report', columns = [], data = [] }) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Please allow pop-ups to generate and print PDF reports.');
    return;
  }

  const now = new Date().toLocaleString('en-IN');

  let rowsHtml = '';
  data.forEach((row, idx) => {
    rowsHtml += `<tr class="${idx % 2 === 0 ? '' : 'alt'}">`;
    columns.forEach((col) => {
      const val = typeof col.getValue === 'function' ? col.getValue(row) : row[col.key];
      rowsHtml += `<td>${formatCell(val)}</td>`;
    });
    rowsHtml += '</tr>';
  });

  let thHtml = '';
  columns.forEach((col) => {
    thHtml += `<th>${col.label || col.key}</th>`;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RF Riddhy — ${title}</title>
      <style>
        @page { size: landscape; margin: 12mm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #1b2e23; background: #fff; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1b2e23; padding-bottom: 12px; margin-bottom: 16px; }
        .brand { font-size: 20px; font-weight: 900; letter-spacing: 0.05em; color: #1b2e23; }
        .brand small { display: block; font-size: 10px; font-weight: 700; color: #2e7d32; letter-spacing: 0.12em; text-transform: uppercase; }
        .meta { text-align: right; font-size: 11px; color: #58655b; }
        h1 { margin: 12px 0 6px 0; font-size: 18px; color: #1b2e23; }
        .count { font-size: 12px; color: #58655b; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1b2e23; color: #fff; text-align: left; padding: 8px 10px; font-weight: 700; border: 1px solid #1b2e23; }
        td { padding: 6px 10px; border: 1px solid #dbe2dc; vertical-align: top; }
        tr.alt { background: #fbf9f5; }
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8e3; display: flex; justify-content: space-between; font-size: 10px; color: #79867c; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 8px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #2e7d32; color: #fff; border: 0; border-radius: 6px; font-weight: 700; cursor: pointer;">Print / Save as PDF</button>
        <button onclick="window.close()" style="padding: 8px 16px; background: #e0e5e1; color: #1b2e23; border: 0; border-radius: 6px; font-weight: 700; cursor: pointer;">Close</button>
      </div>

      <div class="header">
        <div class="brand">
          RF | RIDDHY
          <small>Furniture & Home Appliances · Operations Report</small>
        </div>
        <div class="meta">
          <div>Report: <b>${title}</b></div>
          <div>Printed: ${now}</div>
        </div>
      </div>

      <div class="count">Showing ${data.length} total records</div>

      <table>
        <thead>
          <tr>${thHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <span>RF Riddhy Living · Internal Operations Report</span>
        <span>Page 1</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
