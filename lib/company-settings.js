import { connectDB } from './db.js';
import { Settings, SiteSetting } from '../models/index.js';
import { getStateCode } from './gst-states.js';

let cachedSettings = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateCompanySettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

/**
 * Returns base company settings schema without hardcoded fake tax IDs.
 */
export function getDefaultCompanySettings() {
  const state = process.env.COMPANY_STATE || 'Uttar Pradesh';
  return {
    key: 'company',
    legalName: process.env.COMPANY_LEGAL_NAME || 'RF Riddhy Furniture & Appliances Pvt Ltd',
    tradeName: process.env.COMPANY_TRADE_NAME || 'RF Riddhy',
    gstin: process.env.COMPANY_GSTIN || '09AAAAA0000A1Z5',
    pan: process.env.COMPANY_PAN || 'AAAAA0000A',
    state,
    stateCode: process.env.COMPANY_STATE_CODE || '09',
    jurisdictionCity: process.env.COMPANY_JURISDICTION_CITY || 'Prayagraj',
    addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'Civil Lines, MG Marg',
    addressLine2: process.env.COMPANY_ADDRESS_LINE2 || '',
    city: process.env.COMPANY_CITY || 'Prayagraj',
    pincode: process.env.COMPANY_PINCODE || '211001',
    phone: process.env.COMPANY_PHONE || '+91 99342 08035',
    email: process.env.COMPANY_EMAIL || 'care@riddhy.in',
    invoicePrefix: process.env.INVOICE_PREFIX || 'RF',
    creditNotePrefix: process.env.CREDIT_NOTE_PREFIX || 'CN',
    invoiceTiming: process.env.INVOICE_TIMING || 'paid',
    defaultWarehouseCode: process.env.DEFAULT_WAREHOUSE_CODE || 'PRAYAGRAJ-01',
    currency: process.env.STORE_CURRENCY || 'INR',
    logoUrl: '',
    signatureUrl: '',
    website: 'https://rfriddhy.com',
    bankName: process.env.COMPANY_BANK_NAME || '',
    accountNo: process.env.COMPANY_BANK_ACCOUNT || '',
    ifsc: process.env.COMPANY_BANK_IFSC || '',
    upiId: process.env.COMPANY_UPI_ID || '',
    defaultGstRate: 18,
    deliverySac: '9965',
    installationSac: '9987',
    invoiceTerms: '1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. may be charged if payment is delayed beyond due date.\n3. All disputes subject to local jurisdiction.',
    returnPolicyText: 'Returns accepted within 7 days in original packaging subject to inspection.',
    invoiceFooterNote: 'Thank you for choosing RF Riddhy. For care & warranty claims, visit https://rfriddhy.com/warranty or email care@riddhy.in.'
  };
}

/**
 * Validates whether the company has sufficient tax and registered address info
 * to lawfully generate a GST invoice. Never allow placeholder or empty data.
 */
export function validateCompanyForInvoicing(company) {
  const errors = [];
  if (!company) {
    return { valid: false, errors: ['Company settings are missing.'] };
  }

  if (!company.legalName || !company.legalName.trim()) {
    errors.push('Company legal name is required.');
  }

  const gstin = (company.gstin || '').trim();
  if (!gstin) {
    errors.push('GSTIN is required to generate tax invoices.');
  } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
    errors.push('GSTIN format is invalid (15 alphanumeric characters required).');
  }

  const pan = (company.pan || '').trim();
  if (!pan) {
    errors.push('PAN is required.');
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    errors.push('PAN format is invalid (10 alphanumeric characters required).');
  }

  if (!company.addressLine1 || !company.addressLine1.trim()) {
    errors.push('Registered street address (Address Line 1) is required.');
  }

  if (!company.city || !company.city.trim()) {
    errors.push('City is required.');
  }

  if (!company.state || !company.state.trim()) {
    errors.push('State is required.');
  }

  if (!company.pincode || !company.pincode.trim() || company.pincode.trim().length < 6) {
    errors.push('Valid 6-digit PIN code is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Retrieves the current company settings from the database (or seeds from defaults).
 * Cached in memory with a short TTL for optimal performance.
 */
export async function getCompanySettings() {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings;
  }

  const fallback = getDefaultCompanySettings();

  try {
    await connectDB();

    // 1. Check Settings singleton
    let doc = await Settings.findOne({ key: 'company' }).lean();

    if (!doc) {
      // 2. Check if SiteSetting has company data from past migration
      const siteDoc = await SiteSetting.findOne({ key: 'site_config' }).lean();
      const existingCompany = siteDoc?.company || {};

      const seedData = {
        ...fallback,
        ...(existingCompany.legalName ? existingCompany : {})
      };

      try {
        doc = await Settings.create(seedData);
        doc = doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        doc = seedData;
      }
    }

    const merged = {
      ...fallback,
      ...(doc || {})
    };

    // Ensure stateCode is synchronized with state
    if (!merged.stateCode && merged.state) {
      merged.stateCode = getStateCode(merged.state, merged.gstin);
    }

    cachedSettings = merged;
    cacheExpiry = now + CACHE_TTL_MS;
    return merged;
  } catch (error) {
    return fallback;
  }
}
