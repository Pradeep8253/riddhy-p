export const TAX_RATE_DEFAULT = 0.18;

export function calculateLine({ price, qty, discount = 0 }) {
  const quantity = Math.max(1, Math.floor(Number(qty) || 1));
  const unitPrice = Math.max(0, Number(price) || 0);
  const discountAmount = Math.min(unitPrice, Math.max(0, Number(discount) || 0));
  const taxable = (unitPrice - discountAmount) * quantity;
  const tax = Math.round(taxable * TAX_RATE_DEFAULT * 100) / 100;
  return { qty: quantity, unitPrice, discountAmount, tax, lineTotal: Math.round((taxable + tax) * 100) / 100 };
}

export function quoteCart(items, { deliveryFee = 0, installationFee = 0, couponDiscount = 0 } = {}) {
  const lines = items.map((item) => ({ ...item, ...calculateLine(item) }));
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const tax = lines.reduce((sum, line) => sum + line.tax, 0);
  return { lines, subtotal, tax, deliveryFee, installationFee, couponDiscount, total, currency: 'INR' };
}

export function formatPriceSafe(amount) {
  if (amount === null || amount === undefined) return '';
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}
