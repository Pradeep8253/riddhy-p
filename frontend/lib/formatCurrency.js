export function formatCurrency(amount){
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(amount);
}
export function formatNumber(n){ return new Intl.NumberFormat('en-IN').format(n); }
export function discountPercent(mrp, price){
  if(!mrp || mrp<=price) return 0;
  return Math.round(((mrp-price)/mrp)*100);
}
