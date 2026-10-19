/**
 * Central GST Configuration, Category HSN Defaults, and Validation Rules.
 */

export const CATEGORY_HSN_MAP = {
  // Furniture
  furniture: { hsn: '9403', gstRate: 18, desc: 'Furniture and parts thereof' },
  beds: { hsn: '9403', gstRate: 18, desc: 'Wooden / Metal Beds' },
  sofas: { hsn: '9401', gstRate: 18, desc: 'Seats and sofas' },
  seating: { hsn: '9401', gstRate: 18, desc: 'Chairs and seating' },
  dining: { hsn: '9403', gstRate: 18, desc: 'Dining tables and sets' },
  storage: { hsn: '9403', gstRate: 18, desc: 'Wardrobes, cabinets and shelves' },
  mattresses: { hsn: '9404', gstRate: 18, desc: 'Mattresses and bedding' },
  tables: { hsn: '9403', gstRate: 18, desc: 'Coffee, side, and study tables' },

  // Appliances
  appliance: { hsn: '8516', gstRate: 18, desc: 'Domestic electrical appliances' },
  refrigerators: { hsn: '8418', gstRate: 18, desc: 'Refrigerators and freezers' },
  'washing-machines': { hsn: '8450', gstRate: 18, desc: 'Household washing machines' },
  'air-conditioners': { hsn: '8415', gstRate: 28, desc: 'Air conditioning machines' },
  televisions: { hsn: '8528', gstRate: 18, desc: 'Television receivers and monitors' },
  microwaves: { hsn: '8516', gstRate: 18, desc: 'Microwave ovens and electric cookers' },
  mixers: { hsn: '8509', gstRate: 18, desc: 'Food mixers, grinders, and blenders' },
  'water-purifiers': { hsn: '8421', gstRate: 18, desc: 'Water purifying apparatus' },
  geysers: { hsn: '8516', gstRate: 18, desc: 'Electric instantaneous or storage water heaters' },
  fans: { hsn: '8414', gstRate: 18, desc: 'Electric ceiling and table fans' },
  chimneys: { hsn: '8414', gstRate: 18, desc: 'Range hoods and kitchen chimneys' }
};

export const SERVICE_SAC_CODES = {
  delivery: {
    sac: '9965',
    desc: 'Goods transport and courier delivery services',
    defaultRate: 18
  },
  installation: {
    sac: '9987',
    desc: 'Installation and assembly services',
    defaultRate: 18
  }
};

/**
 * Validates an Indian GSTIN format (15 characters) and mod 36 checksum.
 * Format: 2 digits (State code) + 5 uppercase letters (PAN) + 4 digits (PAN) + 1 letter (PAN)
 *         + 1 alphanumeric (entity #) + 'Z' (default) + 1 check character.
 */
export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.trim().toUpperCase();
  // Statutory Indian GSTIN format: 2-digit state code (01-38, 97, 99) + 10-char PAN + 1 entity char + 'Z' + 1 checksum char
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z0-9A-Z]{1}[0-9A-Z]{1}$/;
  if (!regex.test(clean)) return false;

  // Verify valid state code range (01 to 38, or 97, 99)
  const stateCodeNum = Number.parseInt(clean.slice(0, 2), 10);
  if ((stateCodeNum < 1 || stateCodeNum > 38) && stateCodeNum !== 97 && stateCodeNum !== 99) {
    return false;
  }

  return true;
}

/**
 * Validates Indian PAN format (10 characters: 5 letters, 4 digits, 1 letter).
 */
export function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

export const validateGstin = validateGSTIN;
export const validatePan = validatePAN;

/**
 * Derives default HSN and GST rate for a product based on its category, type, and name.
 */
export function getDefaultTaxInfo(product) {
  const categoryKey = (product?.category || '').toLowerCase().trim();
  const typeKey = (product?.type || '').toLowerCase().trim();
  const nameLower = (product?.name || '').toLowerCase();

  // Keyword overrides in name
  if (nameLower.includes('air conditioner') || nameLower.includes(' ac ') || nameLower.endsWith(' ac')) {
    return { hsn: '8415', gstRate: 28 };
  }
  if (nameLower.includes('refrigerator') || nameLower.includes('fridge')) {
    return { hsn: '8418', gstRate: 18 };
  }
  if (nameLower.includes('washing machine')) {
    return { hsn: '8450', gstRate: 18 };
  }
  if (nameLower.includes('sofa') || nameLower.includes('couch') || nameLower.includes('recliner')) {
    return { hsn: '9401', gstRate: 18 };
  }
  if (nameLower.includes('mattress')) {
    return { hsn: '9404', gstRate: 18 };
  }

  // Category lookup
  if (CATEGORY_HSN_MAP[categoryKey]) {
    return {
      hsn: CATEGORY_HSN_MAP[categoryKey].hsn,
      gstRate: CATEGORY_HSN_MAP[categoryKey].gstRate
    };
  }

  // Type lookup
  if (typeKey === 'appliance') {
    return { hsn: '8516', gstRate: 18 };
  }

  // Default furniture
  return { hsn: '9403', gstRate: 18 };
}
