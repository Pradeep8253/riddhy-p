export function calculatePricing(items, coupon){
  const subtotal = items.reduce((s,i)=> s + i.unitPrice*i.qty,0);
  const mrpTotal = items.reduce((s,i)=> s + (i.mrp||i.unitPrice)*i.qty,0);
  const discount = mrpTotal - subtotal;
  let couponDiscount=0;
  if(coupon){
    if(coupon.discountType==='flat') couponDiscount=Math.min(coupon.discountValue, subtotal*0.2);
    else couponDiscount=Math.min(coupon.discountValue*subtotal/100, coupon.maxDiscount||Infinity);
  }
  const delivery = subtotal>15000?0:199;
  const total = Math.max(0, subtotal - couponDiscount + delivery);
  return { subtotal, mrpTotal, discount, couponDiscount, delivery, total };
}
export function validateCoupon(coupon, subtotal){
  if(!coupon || !coupon.isActive) return {valid:false, reason:'Invalid'};
  const now=new Date();
  if(coupon.validFrom && now<coupon.validFrom) return {valid:false, reason:'Not yet valid'};
  if(coupon.validTo && now>coupon.validTo) return {valid:false, reason:'Expired'};
  if(subtotal < (coupon.minOrderValue||0)) return {valid:false, reason:'Min order not met'};
  return {valid:true};
}
