import { connectDB } from "./db.js";
import {
  Order,
  Invoice,
  CreditNote,
  SequenceCounter,
  Product,
} from "../models/index.js";
import {
  getCompanySettings,
  validateCompanyForInvoicing,
} from "./company-settings.js";
import { getStateCode } from "./gst-states.js";
import { getDefaultTaxInfo, SERVICE_SAC_CODES } from "../config/gstConfig.js";

export function getFinancialYear(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11. April is 3.

  if (month >= 3) {
    const nextShort = String((year + 1) % 100).padStart(2, "0");
    return `${year}-${nextShort}`;
  } else {
    const prevYear = year - 1;
    const curShort = String(year % 100).padStart(2, "0");
    return `${prevYear}-${curShort}`;
  }
}

/**
 * Atomic sequence generator per series and financial year.
 * Prevents gaps and duplicates across concurrent orders.
 */
export async function getNextSequence(
  series = "RF",
  financialYear = getFinancialYear(),
) {
  await connectDB();
  const doc = await SequenceCounter.findOneAndUpdate(
    { series, financialYear },
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const seq = doc.lastNumber;
  const padded = String(seq).padStart(6, "0");
  const number = `${series}/${financialYear}/${padded}`;

  return { number, sequenceNumber: seq, financialYear };
}

/**
 * Convert INR number to words in Indian counting system (Crores, Lakhs, Thousands)
 */
export function numberToWordsINR(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return "Zero Rupees Only";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n) {
    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return `${tens[t]}${u > 0 ? " " + units[u] : ""}`.trim();
  }

  function convertThreeDigits(n) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (h > 0) str += `${units[h]} Hundred`;
    if (rest > 0) {
      if (str) str += " and ";
      str += convertTwoDigits(rest);
    }
    return str.trim();
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  let hundredAndBelow = remainder % 1000;

  const parts = [];
  if (crore > 0) parts.push(`${convertTwoDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} Thousand`);
  if (hundredAndBelow > 0) parts.push(convertThreeDigits(hundredAndBelow));

  return `${parts.join(" ")} Rupees Only`.trim();
}

export function calculateGstBreakup(
  grossAmount,
  gstRate = 18,
  isInterState = false,
) {
  const grossPaise = Math.round(Number(grossAmount || 0) * 100);
  const rate = Number(gstRate) || 0;

  if (rate === 0 || grossPaise === 0) {
    return {
      gross: grossPaise / 100,
      taxable: grossPaise / 100,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      grossPaise,
      taxablePaise: grossPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: 0,
      taxPaise: 0,
    };
  }

  // Reverse calculate taxable: gross / (1 + r/100)
  const taxablePaise = Math.round((grossPaise * 100) / (100 + rate));
  const taxPaise = grossPaise - taxablePaise;

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (isInterState) {
    igstPaise = taxPaise;
  } else {
    cgstPaise = Math.floor(taxPaise / 2);
    sgstPaise = taxPaise - cgstPaise; // absorbs 1 paisa odd split
  }

  return {
    gross: grossPaise / 100,
    taxable: taxablePaise / 100,
    cgst: cgstPaise / 100,
    sgst: sgstPaise / 100,
    igst: igstPaise / 100,
    totalTax: taxPaise / 100,
    grossPaise,
    taxablePaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    taxPaise,
  };
}

export async function generateInvoiceForOrder(orderId, options = {}) {
  await connectDB();

  // 1. Idempotency check: if invoice already exists, return it
  const existing = await Invoice.findOne({ orderId }).lean();
  if (existing) {
    return existing;
  }

  // 2. Fetch order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // 3. Verify company settings - BLOCK if tax/address info is missing
  const company = await getCompanySettings();
  const validation = validateCompanyForInvoicing(company);
  if (!validation.valid) {
    throw new Error(
      `Complete Company & Billing settings first: ${validation.errors.join(" ")}`,
    );
  }

  const sellerState = company.state || "Delhi";
  const sellerStateCode =
    company.stateCode || getStateCode(sellerState, company.gstin);

  const seller = {
    name: company.legalName,
    address: `${company.addressLine1} ${company.addressLine2 || ""}`.trim(),
    city: company.city,
    state: sellerState,
    stateCode: sellerStateCode,
    pincode: company.pincode,
    gstin: company.gstin,
    pan: company.pan,
    phone: company.phone,
    email: company.email,
    bankName: company.bankName,
    accountNo: company.accountNo,
    ifsc: company.ifsc,
    upiId: company.upiId,
    jurisdictionCity: company.jurisdictionCity || company.city || "Prayagraj",
    logoUrl: company.logoUrl || "",
    signatureUrl: company.signatureUrl || "",
  };

  // 4. Buyer Details & Place of Supply
  const buyerState =
    order.billingAddress?.state || order.shippingAddress?.state || sellerState;
  const buyerGstin = order.buyerGstin || order.billingAddress?.gstin || "";
  const isB2B = Boolean(buyerGstin && buyerGstin.trim().length >= 15);
  const buyerBusinessName = isB2B
    ? order.buyerBusinessName ||
      order.billingAddress?.name ||
      "Registered Business"
    : "";
  const buyerStateCode = getStateCode(buyerState, buyerGstin);

  // Place of supply is the delivery/shipping state for goods under GST Act
  const placeOfSupply = buyerState;
  const isInterState = sellerStateCode !== buyerStateCode;

  const invoiceDate =
    order.paymentStatus === "paid" && order.updatedAt
      ? order.updatedAt
      : order.deliveredAt || new Date();
  const fy = getFinancialYear(invoiceDate);
  const series = company.invoicePrefix || "RF";

  // 6. Fetch products for authoritative HSN and GST rates
  const productIds = (order.items || [])
    .map((i) => i.productId)
    .filter(Boolean);
  const productsMap = new Map();
  if (productIds.length > 0) {
    const prods = await Product.find({ _id: { $in: productIds } }).lean();
    prods.forEach((p) => productsMap.set(String(p._id), p));
  }

  // 7. Calculate item lines with accurate GST split and paise accounting
  let totalTaxablePaise = 0;
  let totalCgstPaise = 0;
  let totalSgstPaise = 0;
  let totalIgstPaise = 0;
  let totalGrossPaise = 0;

  const hsnSummaryMap = new Map();

  const invoiceItems = (order.items || []).map((item) => {
    const qty = item.qty || 1;
    const unitPrice = item.unitPrice || 0;
    const gross = unitPrice * qty;
    const discount = item.discount || 0;
    const netGross = Math.max(0, gross - discount);

    // Resolve authoritative HSN and GST Rate
    const prodDoc = item.productId
      ? productsMap.get(String(item.productId))
      : null;
    const defaultTax = getDefaultTaxInfo(
      prodDoc || { name: item.name, category: item.variant?.category },
    );

    const itemGstRate = Number(
      item.gstRate || prodDoc?.gstRate || defaultTax.gstRate || 18,
    );
    const itemHsn = String(
      item.hsn ||
        item.variant?.hsnCode ||
        prodDoc?.hsnCode ||
        defaultTax.hsn ||
        "9403",
    );

    const split = calculateGstBreakup(netGross, itemGstRate, isInterState);

    totalTaxablePaise += split.taxablePaise;
    totalCgstPaise += split.cgstPaise;
    totalSgstPaise += split.sgstPaise;
    totalIgstPaise += split.igstPaise;
    totalGrossPaise += split.grossPaise;

    // Accumulate in HSN summary
    const hsnKey = `${itemHsn}-${itemGstRate}`;
    const curHsn = hsnSummaryMap.get(hsnKey) || {
      hsn: itemHsn,
      description: prodDoc?.category || "Goods",
      taxableValue: 0,
      gstRate: itemGstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    };
    curHsn.taxableValue += split.taxable;
    curHsn.cgstAmount += split.cgst;
    curHsn.sgstAmount += split.sgst;
    curHsn.igstAmount += split.igst;
    curHsn.totalTax += split.totalTax;
    hsnSummaryMap.set(hsnKey, curHsn);

    return {
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku || "RF-ITEM",
      name: item.name,
      hsn: itemHsn,
      qty,
      unitPrice,
      discount,
      taxableValue: split.taxable,
      gstRate: itemGstRate,
      cgstRate: isInterState ? 0 : itemGstRate / 2,
      cgstAmount: split.cgst,
      sgstRate: isInterState ? 0 : itemGstRate / 2,
      sgstAmount: split.sgst,
      igstRate: isInterState ? itemGstRate : 0,
      igstAmount: split.igst,
      lineTotal: split.gross,
      isService: false,
    };
  });

  // 8. Taxable Delivery & Installation Services
  const deliveryGross = Number(order.deliveryFee || 0);
  const deliverySac = company.deliverySac || SERVICE_SAC_CODES.delivery.sac;
  const deliveryRate = 18;
  const deliverySplit = calculateGstBreakup(
    deliveryGross,
    deliveryRate,
    isInterState,
  );

  if (deliveryGross > 0) {
    totalTaxablePaise += deliverySplit.taxablePaise;
    totalCgstPaise += deliverySplit.cgstPaise;
    totalSgstPaise += deliverySplit.sgstPaise;
    totalIgstPaise += deliverySplit.igstPaise;
    totalGrossPaise += deliverySplit.grossPaise;

    const hsnKey = `${deliverySac}-${deliveryRate}`;
    const curHsn = hsnSummaryMap.get(hsnKey) || {
      hsn: deliverySac,
      description: SERVICE_SAC_CODES.delivery.desc,
      taxableValue: 0,
      gstRate: deliveryRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    };
    curHsn.taxableValue += deliverySplit.taxable;
    curHsn.cgstAmount += deliverySplit.cgst;
    curHsn.sgstAmount += deliverySplit.sgst;
    curHsn.igstAmount += deliverySplit.igst;
    curHsn.totalTax += deliverySplit.totalTax;
    hsnSummaryMap.set(hsnKey, curHsn);
  }

  const installationGross = Number(order.installationFee || 0);
  const installationSac =
    company.installationSac || SERVICE_SAC_CODES.installation.sac;
  const installationRate = 18;
  const installationSplit = calculateGstBreakup(
    installationGross,
    installationRate,
    isInterState,
  );

  if (installationGross > 0) {
    totalTaxablePaise += installationSplit.taxablePaise;
    totalCgstPaise += installationSplit.cgstPaise;
    totalSgstPaise += installationSplit.sgstPaise;
    totalIgstPaise += installationSplit.igstPaise;
    totalGrossPaise += installationSplit.grossPaise;

    const hsnKey = `${installationSac}-${installationRate}`;
    const curHsn = hsnSummaryMap.get(hsnKey) || {
      hsn: installationSac,
      description: SERVICE_SAC_CODES.installation.desc,
      taxableValue: 0,
      gstRate: installationRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    };
    curHsn.taxableValue += installationSplit.taxable;
    curHsn.cgstAmount += installationSplit.cgst;
    curHsn.sgstAmount += installationSplit.sgst;
    curHsn.igstAmount += installationSplit.igst;
    curHsn.totalTax += installationSplit.totalTax;
    hsnSummaryMap.set(hsnKey, curHsn);
  }

  // 9. Round-off calculation
  const totalTaxable = totalTaxablePaise / 100;
  const totalCgst = totalCgstPaise / 100;
  const totalSgst = totalSgstPaise / 100;
  const totalIgst = totalIgstPaise / 100;
  const totalTax = (totalCgstPaise + totalSgstPaise + totalIgstPaise) / 100;
  const calculatedGrandTotal =
    (totalTaxablePaise + totalCgstPaise + totalSgstPaise + totalIgstPaise) /
    100;

  const targetTotal = Number(order.total || calculatedGrandTotal);
  const roundedGrandTotal = Math.round(targetTotal);
  const roundOff =
    Math.round((roundedGrandTotal - calculatedGrandTotal) * 100) / 100;

  const amountPaid = order.paymentStatus === "paid" ? roundedGrandTotal : 0;
  const balanceDue = Math.max(0, roundedGrandTotal - amountPaid);

  // 10. Generate sequential atomic number
  const { number, sequenceNumber } = await getNextSequence(series, fy);

  const invoiceData = {
    invoiceNumber: number,
    financialYear: fy,
    sequenceNumber,
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt || new Date(),
    invoiceDate,
    seller,
    buyer: {
      name: isB2B
        ? buyerBusinessName
        : order.billingAddress?.name ||
          order.shippingAddress?.name ||
          order.phone ||
          "Customer",
      businessName: buyerBusinessName,
      isB2B,
      gstin: buyerGstin,
      phone:
        order.phone ||
        order.billingAddress?.phone ||
        order.shippingAddress?.phone ||
        "",
      email: order.email || "",
      billingAddress: order.billingAddress || order.shippingAddress,
      shippingAddress: order.shippingAddress,
      state: buyerState,
      stateCode: buyerStateCode,
    },
    items: invoiceItems,
    taxableAmount: totalTaxable,
    cgstTotal: totalCgst,
    sgstTotal: totalSgst,
    igstTotal: totalIgst,
    totalTax,
    deliveryFee: deliveryGross,
    deliveryTaxable: deliverySplit.taxable,
    deliveryGstRate: deliveryRate,
    deliverySac,
    installationFee: installationGross,
    installationTaxable: installationSplit.taxable,
    installationGstRate: installationRate,
    installationSac,
    roundOff,
    totalAmount: roundedGrandTotal,
    amountPaid,
    balanceDue,
    totalInWords: numberToWordsINR(roundedGrandTotal),
    placeOfSupply,
    jurisdictionCity: seller.jurisdictionCity,
    isInterState,
    paymentStatus:
      order.paymentStatus === "paid"
        ? "paid"
        : order.paymentMethod === "cod"
          ? "unpaid"
          : "unpaid",
    paymentMode: order.paymentMethod || "online",
    paymentReference: order.offlinePayment?.reference || "",
    status: "issued",
    hsnSummary: Array.from(hsnSummaryMap.values()),
    terms: company.invoiceTerms,
    notes: company.invoiceFooterNote,
    events: [
      {
        action: "generated",
        at: new Date(),
        by: options.actor?.name || "System",
        byEmail: options.actor?.email || "system@rfriddhy.com",
        note: `Invoice ${number} issued for order ${order.orderNumber}.`,
      },
    ],
  };

  try {
    const invoice = await Invoice.create(invoiceData);

    // Link invoice back to Order
    order.invoiceNumber = number;
    order.invoiceId = invoice._id;
    await order.save();

    return invoice.toObject ? invoice.toObject() : invoice;
  } catch (err) {
    // Concurrency race: if another request created invoice for this orderId simultaneously
    if (err.code === 11000) {
      const raceExisting = await Invoice.findOne({ orderId }).lean();
      if (raceExisting) return raceExisting;
    }
    throw err;
  }
}

/**
 * Generate a Credit Note for an order refund.
 * Reconciles tax reversed, validates cumulative credit limit, and records audit trail.
 */
export async function generateCreditNoteForRefund(
  orderId,
  refundAmount,
  reason = "Order refund / cancellation",
  actor = null,
) {
  await connectDB();
  const invoice = await Invoice.findOne({ orderId });
  if (!invoice) {
    throw new Error(
      "Cannot issue credit note: no invoice exists for this order.",
    );
  }

  const company = await getCompanySettings();
  const series = company.creditNotePrefix || "CN";
  const fy = getFinancialYear(new Date());

  const refundNum = Number(refundAmount);
  if (!refundNum || refundNum <= 0) {
    throw new Error("Refund amount must be greater than zero.");
  }

  // Cumulative credit guard
  const existingCreditNotes = await CreditNote.find({
    invoiceId: invoice._id,
    status: { $ne: "void" },
  }).lean();

  const previouslyCredited = existingCreditNotes.reduce(
    (sum, cn) => sum + (cn.amount || 0),
    0,
  );
  if (previouslyCredited + refundNum > invoice.totalAmount) {
    throw new Error(
      `Credit note amount (₹${refundNum}) exceeds remaining invoice balance (₹${invoice.totalAmount - previouslyCredited}).`,
    );
  }

  // Reverse calculate tax
  const effectiveGstRate =
    invoice.taxableAmount > 0
      ? Math.round((invoice.totalTax / invoice.taxableAmount) * 100)
      : 18;

  const split = calculateGstBreakup(
    refundNum,
    effectiveGstRate,
    invoice.isInterState,
  );

  const { number, sequenceNumber } = await getNextSequence(series, fy);

  const creditNote = await CreditNote.create({
    creditNoteNumber: number,
    financialYear: fy,
    sequenceNumber,
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    orderId,
    orderNumber: invoice.orderNumber,
    amount: refundNum,
    taxableAmount: split.taxable,
    cgstAmount: split.cgst,
    sgstAmount: split.sgst,
    igstAmount: split.igst,
    totalTax: split.totalTax,
    isInterState: invoice.isInterState,
    gstRate: effectiveGstRate,
    seller: invoice.seller,
    buyer: invoice.buyer,
    items: invoice.items,
    reason,
    issuedAt: new Date(),
    status: "issued",
    notes: `Credit note against invoice ${invoice.invoiceNumber}. ${reason}`,
  });

  // Update invoice with credit note reference and event
  invoice.creditNoteId = creditNote._id;
  if (!invoice.creditNotes) invoice.creditNotes = [];
  invoice.creditNotes.push(creditNote._id);
  invoice.events.push({
    action: "credit_note_issued",
    at: new Date(),
    by: actor?.name || "Operations",
    byEmail: actor?.email || "finance@rfriddhy.com",
    note: `Credit note ${number} issued for ₹${refundNum}. Reason: ${reason}`,
  });
  await invoice.save();

  return creditNote.toObject ? creditNote.toObject() : creditNote;
}
