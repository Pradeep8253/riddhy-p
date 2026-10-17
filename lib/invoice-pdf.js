import PDFDocument from 'pdfkit';

/**
 * Generate a clean, professional GST Tax Invoice PDF Buffer using pdfkit.
 */
export function generateInvoicePdfBuffer(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Tax Invoice - ${invoice.invoiceNumber}`,
          Author: 'RF Riddhy Living Solutions Private Limited',
          Subject: 'Tax Invoice'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const {
        invoiceNumber,
        invoiceDate,
        orderNumber,
        seller = {},
        buyer = {},
        items = [],
        taxableAmount = 0,
        cgstTotal = 0,
        sgstTotal = 0,
        igstTotal = 0,
        deliveryFee = 0,
        installationFee = 0,
        roundOff = 0,
        totalAmount = 0,
        totalInWords = '',
        placeOfSupply = '',
        isInterState = false,
        paymentStatus = 'paid',
        paymentMode = 'online'
      } = invoice;

      const formattedDate = new Date(invoiceDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Colors
      const brandForest = '#1b2e23';
      const textMuted = '#555555';
      const lineBorder = '#d5dbd6';

      // Header Banner
      doc
        .fillColor(brandForest)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('RF | RIDDHY', 40, 40);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(textMuted)
        .text('THOUGHTFUL LIVING & MODERN APPLIANCES', 40, 64);

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor(brandForest)
        .text('TAX INVOICE', 400, 40, { align: 'right' });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`Invoice No: ${invoiceNumber}`, 400, 62, { align: 'right' })
        .text(`Invoice Date: ${formattedDate}`, 400, 74, { align: 'right' })
        .text(`Order No: ${orderNumber}`, 400, 86, { align: 'right' })
        .text(`Place of Supply: ${placeOfSupply || 'West Bengal'}`, 400, 98, { align: 'right' });

      // Divider
      doc
        .strokeColor(lineBorder)
        .lineWidth(1)
        .moveTo(40, 115)
        .lineTo(555, 115)
        .stroke();

      // Seller & Buyer Details
      const yParty = 125;
      // Left: Seller
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(brandForest)
        .text('SOLD BY / SUPPLIER:', 40, yParty);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#222222')
        .text(seller.name || 'RF Riddhy Living Solutions Pvt Ltd', 40, yParty + 14)
        .text(seller.address || 'Plot 42, Salt Lake Sector V', 40, yParty + 26)
        .text(`${seller.city || 'Kolkata'}, ${seller.state || 'West Bengal'} - ${seller.pincode || '700091'}`, 40, yParty + 38)
        .text(`GSTIN: ${seller.gstin || '19AABCR1234F1Z8'} · PAN: ${seller.pan || 'AABCR1234F'}`, 40, yParty + 50)
        .text(`State Code: ${seller.stateCode || '19'} | Phone: ${seller.phone || '+91 98765 43210'}`, 40, yParty + 62);

      // Right: Buyer
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(brandForest)
        .text('BILL TO / RECIPIENT:', 310, yParty);

      const bAddr = buyer.billingAddress || buyer.shippingAddress || {};
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#222222')
        .text(buyer.name || 'Customer', 310, yParty + 14)
        .text(`${bAddr.line1 || ''} ${bAddr.line2 || ''}`.trim() || 'Address on file', 310, yParty + 26)
        .text(`${bAddr.city || ''}, ${buyer.state || bAddr.state || ''} - ${bAddr.pincode || ''}`.trim(), 310, yParty + 38)
        .text(`Phone: ${buyer.phone || bAddr.phone || 'N/A'} | Email: ${buyer.email || 'N/A'}`, 310, yParty + 50)
        .text(buyer.gstin ? `Buyer GSTIN: ${buyer.gstin}` : 'Consumer / Unregistered Person', 310, yParty + 62);

      // Table Header
      const yTable = 210;
      doc
        .rect(40, yTable, 515, 20)
        .fill('#f4efe7');

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandForest)
        .text('#', 45, yTable + 6)
        .text('Description of Goods', 65, yTable + 6)
        .text('HSN', 230, yTable + 6)
        .text('Qty', 270, yTable + 6, { align: 'center', width: 30 })
        .text('Rate (INR)', 305, yTable + 6, { align: 'right', width: 55 })
        .text('Taxable', 365, yTable + 6, { align: 'right', width: 55 })
        .text(isInterState ? 'IGST (18%)' : 'GST (18%)', 425, yTable + 6, { align: 'right', width: 60 })
        .text('Total (INR)', 490, yTable + 6, { align: 'right', width: 60 });

      // Table Rows
      let yRow = yTable + 24;
      items.forEach((item, index) => {
        const itemTax = isInterState ? (item.igstAmount || 0) : ((item.cgstAmount || 0) + (item.sgstAmount || 0));

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#222222')
          .text(String(index + 1), 45, yRow)
          .text(item.name || 'Product', 65, yRow, { width: 160, ellipsis: true })
          .text(item.hsn || '9403', 230, yRow)
          .text(String(item.qty || 1), 270, yRow, { align: 'center', width: 30 })
          .text(Number(item.unitPrice || 0).toLocaleString('en-IN'), 305, yRow, { align: 'right', width: 55 })
          .text(Number(item.taxableValue || 0).toLocaleString('en-IN'), 365, yRow, { align: 'right', width: 55 })
          .text(Number(itemTax).toLocaleString('en-IN'), 425, yRow, { align: 'right', width: 60 })
          .text(Number(item.lineTotal || 0).toLocaleString('en-IN'), 490, yRow, { align: 'right', width: 60 });

        yRow += 18;

        // Page break if list is long
        if (yRow > 680) {
          doc.addPage();
          yRow = 40;
        }
      });

      // Bottom Divider
      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yRow + 4)
        .lineTo(555, yRow + 4)
        .stroke();

      // Calculation Breakdown & In Words
      const yTotal = yRow + 14;

      // Left Box: Amount in words & payment mode
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(brandForest)
        .text('Amount in Words:', 40, yTotal)
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#333333')
        .text(totalInWords || `${Number(totalAmount).toLocaleString('en-IN')} Rupees Only`, 40, yTotal + 12, { width: 280 });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(brandForest)
        .text('Payment Information:', 40, yTotal + 36)
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#444444')
        .text(`Status: ${paymentStatus.toUpperCase()} · Mode: ${paymentMode.toUpperCase()}`, 40, yTotal + 48)
        .text('All goods covered under RF Riddhy Care Warranty Policy.', 40, yTotal + 60);

      // Right Box: Totals
      const xLabel = 360;
      const xVal = 475;
      const wVal = 80;
      let ySub = yTotal;

      const addTotalLine = (label, val, bold = false) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(8.5)
          .fillColor(bold ? brandForest : '#333333')
          .text(label, xLabel, ySub)
          .text(`₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, xVal, ySub, { align: 'right', width: wVal });
        ySub += 14;
      };

      addTotalLine('Taxable Amount:', taxableAmount);
      if (isInterState) {
        addTotalLine('Integrated Tax (IGST 18%):', igstTotal);
      } else {
        addTotalLine('Central Tax (CGST 9%):', cgstTotal);
        addTotalLine('State Tax (SGST 9%):', sgstTotal);
      }
      if (deliveryFee > 0) addTotalLine('Delivery Charges:', deliveryFee);
      if (installationFee > 0) addTotalLine('Installation Charges:', installationFee);
      if (roundOff !== 0) addTotalLine('Round Off:', roundOff);

      // Final Grand Total Box
      doc
        .rect(xLabel - 10, ySub + 2, 205, 22)
        .fill('#eef4ef');

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(brandForest)
        .text('Total Invoice Amount:', xLabel, ySub + 8)
        .text(`₹ ${Number(totalAmount).toLocaleString('en-IN')}`, xVal, ySub + 8, { align: 'right', width: wVal });

      // Signatory & Terms at bottom
      const yBottom = 720;
      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yBottom)
        .lineTo(555, yBottom)
        .stroke();

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(textMuted)
        .text('Terms & Conditions: Returns accepted within 7 days in original packing. Subject to Kolkata jurisdiction only.', 40, yBottom + 8)
        .text('This is a digitally generated tax invoice and does not require a physical signature.', 40, yBottom + 18);

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandForest)
        .text('For RF RIDDHY LIVING SOLUTIONS PVT LTD', 350, yBottom + 8, { align: 'right' })
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(textMuted)
        .text('Authorized Signatory', 350, yBottom + 22, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
