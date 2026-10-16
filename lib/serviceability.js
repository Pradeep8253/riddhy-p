const coveredPrefixes = ['110','121','122','201','122','124'];
const exactDemoPins = new Set(['110001','110011','110016','110019','110020','110024','110025','110030','110048','110049','110054','110065','110074','110075','110092','110096','121001','122001','122002','122008','122017','201301','201303','201304']);
export function checkServiceability(pincode) {
  const code=String(pincode||'');
  const serviceable=exactDemoPins.has(code)||coveredPrefixes.some((prefix)=>code.startsWith(prefix));
  return { serviceable, deliveryDays: serviceable?3:null, installationAvailable: serviceable, message: serviceable?'Demo estimate: delivery options are available for this area. Final dates and charges are confirmed at checkout.':'This pincode is outside the sample service area. Contact Riddhy for a live check.', demoOnly:true };
}
export function estimateFees(items, pincode) {
  const check=checkServiceability(pincode);
  if(!check.serviceable)return {deliveryFee:0,installationFee:0};
  const subtotal=items.reduce((sum,item)=>sum+item.price*item.qty,0);
  const hasAppliance=items.some((item)=>item.type==='appliance');
  return {deliveryFee:subtotal>=50000?0:399,installationFee:hasAppliance?499:0};
}
