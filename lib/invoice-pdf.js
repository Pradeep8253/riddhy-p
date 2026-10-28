import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

/**
 * Format currency to Indian Rupees representation.
 */
function formatInr(val) {
  const num = Number(val || 0);
  return (
    "Rs. " +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}


export async function generateInvoicePdfBuffer(invoice) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Tax Invoice - ${invoice.invoiceNumber}`,
          Author: invoice.seller?.name || "RF Riddhy",
          Subject: `Tax Invoice ${invoice.invoiceNumber}`,
        },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const {
        invoiceNumber,
        invoiceDate,
        orderNumber,
        orderDate,
        seller = {},
        buyer = {},
        items = [],
        taxableAmount = 0,
        cgstTotal = 0,
        sgstTotal = 0,
        igstTotal = 0,
        totalTax = 0,
        deliveryFee = 0,
        deliverySac = "9965",
        installationFee = 0,
        installationSac = "9987",
        roundOff = 0,
        totalAmount = 0,
        amountPaid = 0,
        balanceDue = 0,
        totalInWords = "",
        placeOfSupply = "",
        isInterState = false,
        paymentStatus = "paid",
        paymentMode = "online",
        paymentReference = "",
        hsnSummary = [],
        terms = "",
        notes = "",
      } = invoice;

      const formatToDDMMYYYY = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return "";
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      const formattedInvDate = formatToDDMMYYYY(invoiceDate || Date.now());
      const formattedOrderDate = formatToDDMMYYYY(
        orderDate || invoiceDate || Date.now(),
      );

      // Brand tokens
      const brandForest = "#1b2e23";
      const textDark = "#1e2420";
      const textMuted = "#59655e";
      const lineBorder = "#d4ded6";
      const bgLight = "#f4efe7";

      // Pre-generate UPI QR code for outstanding balance or unpaid invoices
      let upiQrBuffer = null;
      if (seller.upiId && totalAmount > 0) {
        try {
          const upiPayload = `upi://pay?pa=${encodeURIComponent(seller.upiId)}&pn=${encodeURIComponent(seller.name)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent("Invoice " + invoiceNumber)}`;
          upiQrBuffer = await QRCode.toBuffer(upiPayload, {
            width: 140,
            margin: 1,
            color: { dark: "#1b2e23", light: "#ffffff" },
          });
        } catch {
          upiQrBuffer = null;
        }
      }

      // Check for local logo fallback if available
      let logoBuffer = null;
      try {
        const localLogo = path.join(
          process.cwd(),
          "public",
          "images",
          "logo.png",
        );
        if (fs.existsSync(localLogo)) {
          logoBuffer = fs.readFileSync(localLogo);
        }
      } catch {
        logoBuffer = null;
      }

      // Render Header Function (for Page 1)
      const renderHeader = () => {
        if (logoBuffer) {
          try {
            doc.image(logoBuffer, 40, 36, { height: 28 });
          } catch {
            doc
              .font("Helvetica-Bold")
              .fontSize(20)
              .fillColor(brandForest)
              .text("RF RIDDHY", 40, 38);
          }
        } else {
          doc
            .font("Helvetica-Bold")
            .fontSize(20)
            .fillColor(brandForest)
            .text("RF RIDDHY", 40, 38);
        }

        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(textMuted)
          .text("THOUGHTFUL LIVING & MODERN APPLIANCES", 40, 64);
        doc.fontSize(8).text(seller.website || "www.rfriddhy.com", 40, 75);

        // Right title block
        doc
          .font("Helvetica-Bold")
          .fontSize(16)
          .fillColor(brandForest)
          .text("TAX INVOICE", 350, 38, { align: "right", width: 205 });

        // Payment status badge
        const badgeText =
          paymentStatus === "paid"
            ? "PAID"
            : paymentMode === "cod"
              ? "CASH ON DELIVERY"
              : "PAYMENT PENDING";
        const badgeColor =
          paymentStatus === "paid"
            ? "#1b5e20"
            : paymentMode === "cod"
              ? "#b57a1e"
              : "#c62828";
        doc
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .fillColor(badgeColor)
          .text(`[ ${badgeText} ]`, 350, 56, { align: "right", width: 205 });

        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(textDark)
          .text(`Invoice No: ${invoiceNumber}`, 350, 70, {
            align: "right",
            width: 205,
          })
          .text(`Invoice Date: ${formattedInvDate}`, 350, 82, {
            align: "right",
            width: 205,
          })
          .text(`Order No: ${orderNumber} (${formattedOrderDate})`, 350, 94, {
            align: "right",
            width: 205,
          })
          .text(
            `Place of Supply: ${placeOfSupply} (State Code: ${buyer.stateCode || seller.stateCode})`,
            350,
            106,
            { align: "right", width: 205 },
          )
          .text("Reverse Charge: No", 350, 118, { align: "right", width: 205 });

        // Divider
        doc
          .strokeColor(lineBorder)
          .lineWidth(1)
          .moveTo(40, 134)
          .lineTo(555, 134)
          .stroke();
      };

      renderHeader();

      // Seller & Buyer Blocks
      const yParty = 142;
      const colWidth = 245;

      // Left: Seller
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(brandForest)
        .text("SUPPLIER / SOLD BY:", 40, yParty);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(textDark)
        .text(
          seller.name ||
            seller.legalName ||
            "RF Riddhy Living Solutions Pvt Ltd",
          40,
          yParty + 13,
          { width: colWidth },
        );
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333333")
        .text(seller.address, 40, yParty + 25, { width: colWidth })
        .text(
          `${seller.city}, ${seller.state} - ${seller.pincode}`,
          40,
          yParty + 37,
          { width: colWidth },
        )
        .text(`GSTIN: ${seller.gstin} | PAN: ${seller.pan}`, 40, yParty + 49, {
          width: colWidth,
        })
        .text(
          `State Code: ${seller.stateCode} | Phone: ${seller.phone || "N/A"}`,
          40,
          yParty + 61,
          { width: colWidth },
        )
        .text(
          `Email: ${seller.email || "billing@rfriddhy.com"}`,
          40,
          yParty + 73,
          { width: colWidth },
        );

      // Right: Buyer
      const xBuyer = 310;
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(brandForest)
        .text("RECIPIENT / BILL TO:", xBuyer, yParty);

      const bAddr = buyer.billingAddress || buyer.shippingAddress || {};
      const sAddr = buyer.shippingAddress || buyer.billingAddress || {};

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(textDark)
        .text(
          buyer.isB2B ? buyer.businessName : buyer.name,
          xBuyer,
          yParty + 13,
          { width: colWidth },
        );

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333333")
        .text(
          buyer.isB2B
            ? `Attn: ${buyer.name}`
            : `${bAddr.line1 || ""} ${bAddr.line2 || ""}`.trim(),
          xBuyer,
          yParty + 25,
          { width: colWidth },
        )
        .text(
          `${bAddr.city || ""}, ${buyer.state || bAddr.state || ""} - ${bAddr.pincode || ""}`.trim(),
          xBuyer,
          yParty + 37,
          { width: colWidth },
        )
        .text(
          buyer.gstin
            ? `Buyer GSTIN: ${buyer.gstin} (B2B Registered)`
            : "Customer Status: Unregistered Person (B2C)",
          xBuyer,
          yParty + 49,
          { width: colWidth },
        )
        .text(
          `State Code: ${buyer.stateCode || seller.stateCode} | Phone: ${buyer.phone || bAddr.phone || "N/A"}`,
          xBuyer,
          yParty + 61,
          { width: colWidth },
        );

      // Distinct Ship To line if shipping address differs
      if (
        sAddr.line1 &&
        (sAddr.line1 !== bAddr.line1 || sAddr.pincode !== bAddr.pincode)
      ) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(7.5)
          .fillColor(textMuted)
          .text(
            `Ship To: ${sAddr.name || buyer.name}, ${sAddr.line1}, ${sAddr.city} - ${sAddr.pincode}`,
            xBuyer,
            yParty + 73,
            { width: colWidth },
          );
      }

      // Items Table Header Helper
      const renderTableHeader = (y) => {
        doc.rect(40, y, 515, 18).fill(bgLight);
        doc
          .font("Helvetica-Bold")
          .fontSize(7.5)
          .fillColor(brandForest)
          .text("#", 44, y + 5)
          .text("Description of Goods & Services", 60, y + 5)
          .text("HSN/SAC", 215, y + 5)
          .text("Qty", 255, y + 5, { align: "center", width: 24 })
          .text("Rate", 285, y + 5, { align: "right", width: 50 })
          .text("Taxable", 340, y + 5, { align: "right", width: 50 })
          .text("GST %", 395, y + 5, { align: "center", width: 35 })
          .text(isInterState ? "IGST" : "CGST+SGST", 435, y + 5, {
            align: "right",
            width: 55,
          })
          .text("Total", 495, y + 5, { align: "right", width: 55 });
      };

      let yCurrent = 242;
      renderTableHeader(yCurrent);
      yCurrent += 22;

      // Render Items
      items.forEach((item, index) => {
        if (yCurrent > 700) {
          doc.addPage();
          yCurrent = 40;
          renderTableHeader(yCurrent);
          yCurrent += 22;
        }

        const itemTax = isInterState
          ? item.igstAmount || 0
          : (item.cgstAmount || 0) + (item.sgstAmount || 0);

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#222222")
          .text(String(index + 1), 44, yCurrent)
          .text(item.name || "Product", 60, yCurrent, {
            width: 150,
            ellipsis: true,
          })
          .text(item.hsn || "9403", 215, yCurrent)
          .text(String(item.qty || 1), 255, yCurrent, {
            align: "center",
            width: 24,
          })
          .text(formatInr(item.unitPrice), 285, yCurrent, {
            align: "right",
            width: 50,
          })
          .text(formatInr(item.taxableValue), 340, yCurrent, {
            align: "right",
            width: 50,
          })
          .text(`${item.gstRate || 18}%`, 395, yCurrent, {
            align: "center",
            width: 35,
          })
          .text(formatInr(itemTax), 435, yCurrent, {
            align: "right",
            width: 55,
          })
          .text(formatInr(item.lineTotal), 495, yCurrent, {
            align: "right",
            width: 55,
          });

        yCurrent += 16;
      });

      // Render Delivery Service Line if charged
      if (deliveryFee > 0) {
        if (yCurrent > 700) {
          doc.addPage();
          yCurrent = 40;
          renderTableHeader(yCurrent);
          yCurrent += 22;
        }
        const delTaxable = Math.round((deliveryFee / 1.18) * 100) / 100;
        const delTax = Math.round((deliveryFee - delTaxable) * 100) / 100;

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#333333")
          .text("-", 44, yCurrent)
          .text("Doorstep Delivery & Freight (Service)", 60, yCurrent, {
            width: 150,
          })
          .text(deliverySac, 215, yCurrent)
          .text("1", 255, yCurrent, { align: "center", width: 24 })
          .text(formatInr(deliveryFee), 285, yCurrent, {
            align: "right",
            width: 50,
          })
          .text(formatInr(delTaxable), 340, yCurrent, {
            align: "right",
            width: 50,
          })
          .text("18%", 395, yCurrent, { align: "center", width: 35 })
          .text(formatInr(delTax), 435, yCurrent, { align: "right", width: 55 })
          .text(formatInr(deliveryFee), 495, yCurrent, {
            align: "right",
            width: 55,
          });

        yCurrent += 16;
      }

      // Render Installation Service Line if charged
      if (installationFee > 0) {
        if (yCurrent > 700) {
          doc.addPage();
          yCurrent = 40;
          renderTableHeader(yCurrent);
          yCurrent += 22;
        }
        const instTaxable = Math.round((installationFee / 1.18) * 100) / 100;
        const instTax = Math.round((installationFee - instTaxable) * 100) / 100;

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#333333")
          .text("-", 44, yCurrent)
          .text(
            "Professional Assembly & Installation (Service)",
            60,
            yCurrent,
            { width: 150 },
          )
          .text(installationSac, 215, yCurrent)
          .text("1", 255, yCurrent, { align: "center", width: 24 })
          .text(formatInr(installationFee), 285, yCurrent, {
            align: "right",
            width: 50,
          })
          .text(formatInr(instTaxable), 340, yCurrent, {
            align: "right",
            width: 50,
          })
          .text("18%", 395, yCurrent, { align: "center", width: 35 })
          .text(formatInr(instTax), 435, yCurrent, {
            align: "right",
            width: 55,
          })
          .text(formatInr(installationFee), 495, yCurrent, {
            align: "right",
            width: 55,
          });

        yCurrent += 16;
      }

      // Bottom line of items table
      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yCurrent + 2)
        .lineTo(555, yCurrent + 2)
        .stroke();
      yCurrent += 10;

      // Check if room is needed for summaries and totals (needs ~180px)
      if (yCurrent > 580) {
        doc.addPage();
        yCurrent = 40;
      }

      // HSN-WISE TAX SUMMARY TABLE (Standard GST Requirement)
      const yHsn = yCurrent;
      doc.rect(40, yHsn, 260, 14).fill(bgLight);
      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(brandForest)
        .text("HSN/SAC", 44, yHsn + 3)
        .text("Taxable (INR)", 100, yHsn + 3, { align: "right", width: 50 })
        .text("Rate", 155, yHsn + 3, { align: "center", width: 25 })
        .text(isInterState ? "IGST" : "CGST", 185, yHsn + 3, {
          align: "right",
          width: 35,
        })
        .text(isInterState ? "" : "SGST", 225, yHsn + 3, {
          align: "right",
          width: 35,
        })
        .text("Total Tax", 262, yHsn + 3, { align: "right", width: 35 });

      let yHsnRow = yHsn + 16;
      hsnSummary.forEach((h) => {
        doc
          .font("Helvetica")
          .fontSize(6.5)
          .fillColor("#333333")
          .text(h.hsn, 44, yHsnRow)
          .text(formatInr(h.taxableValue).replace("Rs. ", ""), 100, yHsnRow, {
            align: "right",
            width: 50,
          })
          .text(`${h.gstRate}%`, 155, yHsnRow, { align: "center", width: 25 })
          .text(
            formatInr(isInterState ? h.igstAmount : h.cgstAmount).replace(
              "Rs. ",
              "",
            ),
            185,
            yHsnRow,
            { align: "right", width: 35 },
          )
          .text(
            isInterState ? "-" : formatInr(h.sgstAmount).replace("Rs. ", ""),
            225,
            yHsnRow,
            { align: "right", width: 35 },
          )
          .text(formatInr(h.totalTax).replace("Rs. ", ""), 262, yHsnRow, {
            align: "right",
            width: 35,
          });
        yHsnRow += 11;
      });

      // Amount in Words
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(brandForest)
        .text("Amount in Words:", 40, yHsnRow + 8);
      doc
        .font("Helvetica-Oblique")
        .fontSize(7.5)
        .fillColor("#333333")
        .text(totalInWords, 40, yHsnRow + 19, { width: 260 });

      // Payment & Bank Information Block
      const yPay = yHsnRow + 40;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(brandForest)
        .text("Payment & Bank Details:", 40, yPay);
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#333333")
        .text(
          `Mode: ${paymentMode.toUpperCase()} | Status: ${paymentStatus.toUpperCase()}${paymentReference ? " | Ref: " + paymentReference : ""}`,
          40,
          yPay + 11,
        )
        .text(
          `Bank: ${seller.bankName || "HDFC Bank Ltd"} | A/c: ${seller.accountNo || "N/A"}`,
          40,
          yPay + 21,
        )
        .text(
          `IFSC: ${seller.ifsc || "N/A"} | UPI: ${seller.upiId || "N/A"}`,
          40,
          yPay + 31,
        )
        .text("Care & Warranty: https://rfriddhy.com/warranty", 40, yPay + 41);

      // UPI QR Code on Left (if buffer available and unpaid / COD)
      if (upiQrBuffer && paymentStatus !== "paid") {
        doc.image(upiQrBuffer, 225, yPay - 2, { width: 58, height: 58 });
        doc
          .fontSize(6)
          .font("Helvetica-Oblique")
          .fillColor(textMuted)
          .text("Scan UPI to Pay", 225, yPay + 58, {
            width: 58,
            align: "center",
          });
      }

      // RIGHT COLUMN: TOTALS BREAKDOWN
      const xLabel = 350;
      const xVal = 475;
      const wVal = 80;
      let ySub = yCurrent;

      const addTotalLine = (label, val, bold = false) => {
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8)
          .fillColor(bold ? brandForest : "#333333")
          .text(label, xLabel, ySub)
          .text(formatInr(val), xVal, ySub, { align: "right", width: wVal });
        ySub += 13;
      };

      addTotalLine("Taxable Amount:", taxableAmount);
      if (isInterState) {
        addTotalLine("Integrated Tax (IGST):", igstTotal);
      } else {
        addTotalLine("Central Tax (CGST):", cgstTotal);
        addTotalLine("State Tax (SGST):", sgstTotal);
      }
      if (deliveryFee > 0) addTotalLine("Delivery (incl. GST):", deliveryFee);
      if (installationFee > 0)
        addTotalLine("Installation (incl. GST):", installationFee);
      if (roundOff !== 0) addTotalLine("Round Off:", roundOff);

      // Grand Total Highlight Box
      doc.rect(xLabel - 10, ySub + 2, 215, 20).fill("#eef4ef");
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(brandForest)
        .text("Grand Total:", xLabel, ySub + 7)
        .text(formatInr(totalAmount), xVal, ySub + 7, {
          align: "right",
          width: wVal,
        });
      ySub += 26;

      // Paid / Balance Due
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#333333")
        .text("Amount Paid:", xLabel, ySub)
        .text(formatInr(amountPaid), xVal, ySub, {
          align: "right",
          width: wVal,
        });
      ySub += 12;

      doc
        .font(balanceDue > 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(7.5)
        .fillColor(balanceDue > 0 ? "#c62828" : "#1b5e20")
        .text("Balance Due:", xLabel, ySub)
        .text(formatInr(balanceDue), xVal, ySub, {
          align: "right",
          width: wVal,
        });

      // Signatory & Jurisdiction at Bottom
      const yFooter = 730;
      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yFooter)
        .lineTo(555, yFooter)
        .stroke();

      const jurisdiction = seller.jurisdictionCity || seller.city || "Prayagraj";
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(textMuted)
        .text(
          `Terms: ${terms || "Goods covered under RF Riddhy Warranty Policy."}`,
          40,
          yFooter + 6,
          { width: 330 },
        )
        .text(
          `Subject to ${jurisdiction} jurisdiction only. This is a computer generated invoice and does not require a physical signature.`,
          40,
          yFooter + 18,
          { width: 330 },
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(brandForest)
        .text(
          `For ${(seller.name || seller.legalName || "RF RIDDHY").toUpperCase()}`,
          350,
          yFooter + 6,
          { align: "right", width: 205 },
        )
        .font("Helvetica")
        .fontSize(7)
        .fillColor(textMuted)
        .text("Authorized Signatory", 350, yFooter + 22, {
          align: "right",
          width: 205,
        });

      // Page X of Y Footer on All Pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#888888")
          .text(`Page ${i + 1} of ${range.count}`, 40, doc.page.height - 20, {
            align: "center",
            width: 515,
            lineBreak: false,
          });
        doc.page.margins.bottom = oldBottomMargin;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an A4 GST Credit Note PDF Buffer.
 * Reuses identical typography, brand tokens, and compliance structure.
 */
export async function generateCreditNotePdfBuffer(creditNote) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Credit Note - ${creditNote.creditNoteNumber}`,
          Author: creditNote.seller?.name || "RF Riddhy",
          Subject: `Credit Note ${creditNote.creditNoteNumber}`,
        },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      const {
        creditNoteNumber,
        issuedAt,
        invoiceNumber,
        invoiceDate,
        orderNumber,
        seller = {},
        buyer = {},
        amount = 0,
        taxableAmount = 0,
        cgstAmount = 0,
        sgstAmount = 0,
        igstAmount = 0,
        isInterState = false,
        gstRate = 18,
        reason = "Order refund / return",
        notes = "",
      } = creditNote;

      const brandForest = "#1b2e23";
      const textMuted = "#59655e";
      const lineBorder = "#d4ded6";
      const formatToDDMMYYYY = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return "";
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      const formattedDate = formatToDDMMYYYY(issuedAt || Date.now());
      const formattedInvDate = formatToDDMMYYYY(invoiceDate || Date.now());

      // Header
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(brandForest)
        .text("RF RIDDHY", 40, 38);
      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(textMuted)
        .text("CUSTOMER REFUND & CREDIT MEMORANDUM", 40, 64);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#c62828")
        .text("CREDIT NOTE", 350, 38, { align: "right", width: 205 });
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#222222")
        .text(`Credit Note No: ${creditNoteNumber}`, 350, 60, {
          align: "right",
          width: 205,
        })
        .text(`Date of Issue: ${formattedDate}`, 350, 72, {
          align: "right",
          width: 205,
        })
        .text(`Original Invoice No: ${invoiceNumber}`, 350, 84, {
          align: "right",
          width: 205,
        })
        .text(`Original Invoice Date: ${formattedInvDate}`, 350, 96, {
          align: "right",
          width: 205,
        })
        .text(`Order Reference: ${orderNumber}`, 350, 108, {
          align: "right",
          width: 205,
        });

      doc
        .strokeColor(lineBorder)
        .lineWidth(1)
        .moveTo(40, 126)
        .lineTo(555, 126)
        .stroke();

      // Parties
      const yParty = 136;
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(brandForest)
        .text("ISSUED BY:", 40, yParty);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#222222")
        .text(seller.name || "RF Riddhy", 40, yParty + 13);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333333")
        .text(seller.address || "", 40, yParty + 25)
        .text(
          `${seller.city || ""}, ${seller.state || ""} - ${seller.pincode || ""}`,
          40,
          yParty + 37,
        )
        .text(`GSTIN: ${seller.gstin} | PAN: ${seller.pan}`, 40, yParty + 49);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(brandForest)
        .text("CREDITED TO (BUYER):", 310, yParty);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#222222")
        .text(buyer.isB2B ? buyer.businessName : buyer.name, 310, yParty + 13);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333333")
        .text(
          buyer.billingAddress?.line1 ||
            buyer.shippingAddress?.line1 ||
            "Address on record",
          310,
          yParty + 25,
        )
        .text(
          `${buyer.state || ""} (State Code: ${buyer.stateCode || seller.stateCode})`,
          310,
          yParty + 37,
        )
        .text(
          buyer.gstin
            ? `Buyer GSTIN: ${buyer.gstin}`
            : "Consumer / Unregistered",
          310,
          yParty + 49,
        );

      // Credit Breakdown Table
      const yTable = 210;
      doc.rect(40, yTable, 515, 18).fill("#f4efe7");
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(brandForest)
        .text("Particulars / Reason", 48, yTable + 5)
        .text("Taxable Value", 280, yTable + 5, { align: "right", width: 60 })
        .text("Rate", 350, yTable + 5, { align: "center", width: 30 })
        .text(
          isInterState ? "IGST Reversed" : "CGST+SGST Reversed",
          390,
          yTable + 5,
          { align: "right", width: 85 },
        )
        .text("Credit Amount", 485, yTable + 5, { align: "right", width: 65 });

      const yRow = yTable + 24;
      const totalTaxReversed = isInterState
        ? igstAmount
        : cgstAmount + sgstAmount;

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#222222")
        .text(`Adjustment / Refund: ${reason}`, 48, yRow, { width: 220 })
        .text(formatInr(taxableAmount), 280, yRow, {
          align: "right",
          width: 60,
        })
        .text(`${gstRate}%`, 350, yRow, { align: "center", width: 30 })
        .text(formatInr(totalTaxReversed), 390, yRow, {
          align: "right",
          width: 85,
        })
        .text(formatInr(amount), 485, yRow, { align: "right", width: 65 });

      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yRow + 20)
        .lineTo(555, yRow + 20)
        .stroke();

      // Totals Box
      const yTotal = yRow + 32;
      doc.rect(330, yTotal, 225, 22).fill("#fbe9e7");
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#c62828")
        .text("Total Credit Allowed:", 340, yTotal + 6)
        .text(formatInr(amount), 450, yTotal + 6, {
          align: "right",
          width: 95,
        });

      // Signatory
      const yBot = 680;
      doc
        .strokeColor(lineBorder)
        .lineWidth(0.5)
        .moveTo(40, yBot)
        .lineTo(555, yBot)
        .stroke();
      doc
        .fontSize(7.5)
        .font("Helvetica")
        .fillColor(textMuted)
        .text(
          "Note: This Credit Note adjusts taxable value and GST liability in accordance with Section 34 of the CGST Act.",
          40,
          yBot + 8,
          { width: 300 },
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(brandForest)
        .text(
          `For ${seller.name?.toUpperCase() || "RF RIDDHY"}`,
          350,
          yBot + 8,
          { align: "right", width: 205 },
        )
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(textMuted)
        .text("Authorized Signatory", 350, yBot + 22, {
          align: "right",
          width: 205,
        });

      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#888888")
          .text(`Page ${i + 1} of ${range.count}`, 40, doc.page.height - 20, {
            align: "center",
            width: 515,
            lineBreak: false,
          });
        doc.page.margins.bottom = oldBottomMargin;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
