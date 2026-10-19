const coveredPrefixes = ['110', '121', '122', '201', '124'];
const exactDemoPins = new Set([
  '110001', '110011', '110016', '110019', '110020', '110024', '110025', '110030',
  '110048', '110049', '110054', '110065', '110074', '110075', '110092', '110096',
  '121001', '122001', '122002', '122008', '122017', '201301', '201303', '201304'
]);

export function lookupPincode(pincode) {
  const pin = String(pincode || '').trim();
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return null;
  }

  let city = '';
  let state = '';

  if (pin.startsWith('110')) {
    city = 'New Delhi';
    state = 'Delhi';
  } else if (pin.startsWith('122')) {
    city = 'Gurugram';
    state = 'Haryana';
  } else if (pin.startsWith('121')) {
    city = 'Faridabad';
    state = 'Haryana';
  } else if (pin.startsWith('2013')) {
    city = 'Noida';
    state = 'Uttar Pradesh';
  } else if (pin.startsWith('2010')) {
    city = 'Ghaziabad';
    state = 'Uttar Pradesh';
  } else if (pin.startsWith('400')) {
    city = 'Mumbai';
    state = 'Maharashtra';
  } else if (pin.startsWith('560')) {
    city = 'Bengaluru';
    state = 'Karnataka';
  } else if (pin.startsWith('700')) {
    city = 'Kolkata';
    state = 'West Bengal';
  } else if (pin.startsWith('600')) {
    city = 'Chennai';
    state = 'Tamil Nadu';
  } else if (pin.startsWith('500')) {
    city = 'Hyderabad';
    state = 'Telangana';
  } else if (pin.startsWith('411')) {
    city = 'Pune';
    state = 'Maharashtra';
  } else if (pin.startsWith('302')) {
    city = 'Jaipur';
    state = 'Rajasthan';
  } else if (pin.startsWith('380')) {
    city = 'Ahmedabad';
    state = 'Gujarat';
  } else if (pin.startsWith('160')) {
    city = 'Chandigarh';
    state = 'Chandigarh';
  }

  const check = checkServiceability(pin);
  return {
    pincode: pin,
    city,
    state,
    serviceable: check.serviceable,
    deliveryDays: check.deliveryDays,
    installationAvailable: check.installationAvailable,
    message: check.message
  };
}

export function checkServiceability(pincode) {
  const code = String(pincode || '').trim();
  const serviceable = exactDemoPins.has(code) || coveredPrefixes.some((prefix) => code.startsWith(prefix));
  return {
    serviceable,
    deliveryDays: serviceable ? 3 : 7,
    installationAvailable: serviceable,
    message: serviceable
      ? 'Express delivery and white-glove installation available for this area.'
      : 'Standard logistics delivery available. Final schedule confirmed upon booking.',
    demoOnly: false
  };
}

export function estimateFees(items, pincode) {
  const check = checkServiceability(pincode);
  const subtotal = (items || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const hasAppliance = (items || []).some((item) => item.type === 'appliance');
  return {
    deliveryFee: subtotal >= 35000 ? 0 : (check.serviceable ? 399 : 799),
    installationFee: hasAppliance ? 499 : 0
  };
}
