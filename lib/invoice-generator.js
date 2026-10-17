import { connectDB } from '@/lib/db';
import { Order, Invoice, CreditNote, SequenceCounter, SiteSetting } from '@/models/index';

/**
 * Get Indian Financial Year format (e.g. '2026-27')
 * Runs April 1 to March 31.
 */
export function getFinancialYear(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11. April is 3.

  if (month >= 3) {
    const nextShort = String((year + 1) % 100).padStart(2, '0');
    return `${year}-${nextShort}`;
  } else {
    const prevYear = year - 1;
    const curShort = String(year % 100).padStart(2, '0');
    return `${prevYear}-${curShort}`;
  }
}

/**
 * Atomic sequence generator per series and financial year.
 * Prevents gaps and duplicates across concurrent orders.
 */
export async function getNextSequence(series = 'RF', financialYear = getFinancialYear()) {
  await connectDB();
  const doc = await SequenceCounter.findOneAndUpdate(
    { series, financialYear },
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const seq = doc.lastNumber;
  const padded = String(seq).padStart(6, '0');
  const number = `${series}/${financialYear}/${padded}`;

  return { number, sequenceNumber: seq, financialYear };
}

/**
 * Convert INR number to words in Indian counting system (Crores, Lakhs, Thousands)
 */
export function numberToWordsINR(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return `${tens[t]}${u > 0 ? ' ' + units[u] : ''}`.trim();
  }

  function convertThreeDigits(n) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (h > 0) str += `${units[h]} Hundred`;
    if (rest > 0) {
      if (str) str += ' and ';
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

  return `${parts.join(' ')} Rupees Only`.trim();
}

/**
 * Generate a GST-compliant Invoice for an order.
 * Idempotent: returns existing invoice if already issued.
 */
export async function generateInvoiceForOrder(orderId) {
  await connectDB();
  const existing = await Invoice.findOne({ orderId }).lean();
  if (existing) {
    return existing;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Read seller company settings from database or fallback defaults
  const settingDoc = await SiteSetting.findOne({ key: 'company' }).lean().catch(() => null);
  const company = settingDoc?.value || {};

  const seller = {
    name: company.legalName || 'RF Riddhy Living Solutions Private Limited',
    address: company.registeredAddress || 'Plot 42, Salt Lake Sector V',
    city: company.city || 'Kolkata',
    state: company.state || 'West Bengal',
    stateCode: company.stateCode || '19',
    pincode: company.pincode || '700091',
    gstin: company.gstin || '19AABCR1234F1Z8',
    pan: company.pan || 'AABCR1234F',
    phone: company.phone || '+91 98765 43210',
    email: company.email || 'billing@rfriddhy.com'
  };

  const buyerState = order.billingAddress?.state || order.shippingAddress?.state || 'West Bengal';
  const buyerName = order.billingAddress?.name || order.shippingAddress?.name || order.phone || 'Customer';
  const isInterState = seller.state.toLowerCase().trim() !== buyerState.toLowerCase().trim();

  // Sequential atomic invoice number
  const fy = getFinancialYear(order.createdAt || new Date());
  const series = company.invoicePrefix || 'RF';
  const { number, sequenceNumber } = await getNextSequence(series, fy);

  // Calculate items with GST breakup (prices are retail gross inclusive of 18% GST)
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const invoiceItems = (order.items || []).map((item) => {
    const qty = item.qty || 1;
    const unitPrice = item.unitPrice || 0;
    const gross = unitPrice * qty;
    const discount = item.discount || 0;
    const netGross = Math.max(0, gross - discount);

    // 18% GST inclusive split
    const taxableValue = Math.round((netGross / 1.18) * 100) / 100;
    const taxAmount = Math.round((netGross - taxableValue) * 100) / 100;

    let cgstRate = 0, cgstAmount = 0, sgstRate = 0, sgstAmount = 0, igstRate = 0, igstAmount = 0;
    if (isInterState) {
      igstRate = 18;
      igstAmount = taxAmount;
      totalIgst += igstAmount;
    } else {
      cgstRate = 9;
      cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
      sgstRate = 9;
      sgstAmount = taxAmount - cgstAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
    }

    totalTaxable += taxableValue;

    return {
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku || 'RF-GEN',
      name: item.name,
      hsn: item.sku?.startsWith('APP') ? '8418' : '9403',
      qty,
      unitPrice,
      discount,
      taxableValue,
      gstRate: 18,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      lineTotal: netGross
    };
  });

  const deliveryFee = order.deliveryFee || 0;
  const installationFee = order.installationFee || 0;
  const grossTotal = totalTaxable + totalCgst + totalSgst + totalIgst + deliveryFee + installationFee;
  const finalTotal = Math.round(order.total || grossTotal);
  const roundOff = Math.round((finalTotal - grossTotal) * 100) / 100;

  const invoice = await Invoice.create({
    invoiceNumber: number,
    financialYear: fy,
    sequenceNumber,
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt || new Date(),
    invoiceDate: new Date(),
    seller,
    buyer: {
      name: buyerName,
      phone: order.phone,
      email: order.email,
      billingAddress: order.billingAddress || order.shippingAddress,
      shippingAddress: order.shippingAddress,
      state: buyerState,
      stateCode: isInterState ? '99' : seller.stateCode
    },
    items: invoiceItems,
    taxableAmount: Math.round(totalTaxable * 100) / 100,
    cgstTotal: Math.round(totalCgst * 100) / 100,
    sgstTotal: Math.round(totalSgst * 100) / 100,
    igstTotal: Math.round(totalIgst * 100) / 100,
    totalTax: Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100,
    deliveryFee,
    installationFee,
    roundOff,
    totalAmount: finalTotal,
    totalInWords: numberToWordsINR(finalTotal),
    placeOfSupply: buyerState,
    isInterState,
    paymentStatus: order.paymentStatus === 'paid' ? 'paid' : 'unpaid',
    paymentMode: order.paymentMethod || 'online',
    status: 'issued',
    notes: 'Computer generated tax invoice. Goods once sold are covered under RF Riddhy Care Warranty Policy.'
  });

  // Attach invoice back to Order
  order.invoiceNumber = number;
  order.invoiceId = invoice._id;
  await order.save();

  return invoice.toObject ? invoice.toObject() : invoice;
}

/**
 * Generate a Credit Note on refund for an order.
 */
export async function generateCreditNoteForRefund(orderId, refundAmount, reason = 'Order refund / cancellation') {
  await connectDB();
  const invoice = await Invoice.findOne({ orderId });
  if (!invoice) return null;

  const fy = getFinancialYear(new Date());
  const { number, sequenceNumber } = await getNextSequence('RF/CN', fy);

  const creditNote = await CreditNote.create({
    creditNoteNumber: number,
    financialYear: fy,
    sequenceNumber,
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    orderId,
    orderNumber: invoice.orderNumber,
    amount: Number(refundAmount),
    reason,
    issuedAt: new Date(),
    status: 'issued',
    notes: `Credit note against invoice ${invoice.invoiceNumber}.`
  });

  invoice.creditNoteId = creditNote._id;
  await invoice.save();

  return creditNote.toObject ? creditNote.toObject() : creditNote;
}
