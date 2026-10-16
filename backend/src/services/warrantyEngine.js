// Warranty engine: computes daysRemaining server-side, activation trigger per brand/category
export function computeWarranty({ purchaseDate, activationDate, expiryDate, policy, now=new Date(), timezone='Asia/Kolkata' }){
  // activation trigger configurable
  const activation = activationDate || null;
  if(!activation) return { status:'Pending Activation', daysRemaining:null, expiry:null };
  const expiry = expiryDate || new Date(new Date(activation).getTime() + policy.manufacturerDays*24*3600*1000);
  const diffMs = expiry - now;
  const daysRemaining = Math.ceil(diffMs / (24*3600*1000));
  let status='Active';
  if(daysRemaining<=0) status='Expired';
  else if(daysRemaining<=30) status='Expiring Soon';
  // claim open etc handled elsewhere
  return { status, daysRemaining: Math.max(0,daysRemaining), expiry, totalDays: policy.manufacturerDays };
}
export function getPolicyFor(product, policies){
  // match brand/category
  return policies.find(p=> p.brand===product.brand || p.category===product.category) || { manufacturerDays:365, sellerDays:0, activationTrigger:'delivery_date' };
}
