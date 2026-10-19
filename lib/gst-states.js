/**
 * Indian States and Union Territories with official 2-digit GST State Codes.
 * Total: 36 states/UTs + Other Territory (97).
 */

export const GST_STATES = [
  { code: '01', name: 'Jammu and Kashmir', type: 'UT' },
  { code: '02', name: 'Himachal Pradesh', type: 'State' },
  { code: '03', name: 'Punjab', type: 'State' },
  { code: '04', name: 'Chandigarh', type: 'UT' },
  { code: '05', name: 'Uttarakhand', type: 'State' },
  { code: '06', name: 'Haryana', type: 'State' },
  { code: '07', name: 'Delhi', type: 'UT' },
  { code: '08', name: 'Rajasthan', type: 'State' },
  { code: '09', name: 'Uttar Pradesh', type: 'State' },
  { code: '10', name: 'Bihar', type: 'State' },
  { code: '11', name: 'Sikkim', type: 'State' },
  { code: '12', name: 'Arunachal Pradesh', type: 'State' },
  { code: '13', name: 'Nagaland', type: 'State' },
  { code: '14', name: 'Manipur', type: 'State' },
  { code: '15', name: 'Mizoram', type: 'State' },
  { code: '16', name: 'Tripura', type: 'State' },
  { code: '17', name: 'Meghalaya', type: 'State' },
  { code: '18', name: 'Assam', type: 'State' },
  { code: '19', name: 'West Bengal', type: 'State' },
  { code: '20', name: 'Jharkhand', type: 'State' },
  { code: '21', name: 'Odisha', type: 'State' },
  { code: '22', name: 'Chhattisgarh', type: 'State' },
  { code: '23', name: 'Madhya Pradesh', type: 'State' },
  { code: '24', name: 'Gujarat', type: 'State' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UT' },
  { code: '27', name: 'Maharashtra', type: 'State' },
  { code: '29', name: 'Karnataka', type: 'State' },
  { code: '30', name: 'Goa', type: 'State' },
  { code: '31', name: 'Lakshadweep', type: 'UT' },
  { code: '32', name: 'Kerala', type: 'State' },
  { code: '33', name: 'Tamil Nadu', type: 'State' },
  { code: '34', name: 'Puducherry', type: 'UT' },
  { code: '35', name: 'Andaman and Nicobar Islands', type: 'UT' },
  { code: '36', name: 'Telangana', type: 'State' },
  { code: '37', name: 'Andhra Pradesh', type: 'State' },
  { code: '38', name: 'Ladakh', type: 'UT' }
];

export const STATE_CODE_MAP = Object.fromEntries(
  GST_STATES.map((s) => [s.name.toLowerCase(), s.code])
);

// Common alias mappings (e.g. New Delhi -> 07, Orissa -> 21)
const ALIASES = {
  'new delhi': '07',
  'nct of delhi': '07',
  'delhi ncr': '07',
  'orissa': '21',
  'pondicherry': '34',
  'uttaranchal': '05',
  'daman and diu': '26',
  'dadra and nagar haveli': '26'
};

/**
 * Returns the 2-digit GST state code for a given state name.
 * If not recognized, returns fallback or extracts from GSTIN if provided.
 */
export function getStateCode(stateName, gstin = null) {
  if (gstin && typeof gstin === 'string' && gstin.trim().length >= 2) {
    const fromGstin = gstin.trim().slice(0, 2);
    if (/^\d{2}$/.test(fromGstin)) {
      return fromGstin;
    }
  }

  if (!stateName || typeof stateName !== 'string') {
    return '07'; // Default to Delhi if undetermined
  }

  const clean = stateName.trim().toLowerCase();
  if (STATE_CODE_MAP[clean]) {
    return STATE_CODE_MAP[clean];
  }

  if (ALIASES[clean]) {
    return ALIASES[clean];
  }

  // Partial match search
  for (const s of GST_STATES) {
    if (clean.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(clean)) {
      return s.code;
    }
  }

  return '07';
}

/**
 * Returns the official state name for a given 2-digit state code.
 */
export function getStateNameByCode(code) {
  if (!code) return 'Delhi';
  const padded = String(code).padStart(2, '0');
  const found = GST_STATES.find((s) => s.code === padded);
  return found ? found.name : 'Delhi';
}
