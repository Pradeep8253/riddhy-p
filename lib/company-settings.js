import { connectDB } from '@/lib/db';
import { Settings, SiteSetting } from '@/models/index';

let cachedSettings = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateCompanySettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

/**
 * Fallback defaults seeded from old environment variables or system standards.
 */
export function getDefaultCompanySettings() {
  return {
    key: 'company',
    legalName: process.env.COMPANY_LEGAL_NAME || 'RF Riddhy Furniture & Appliances Pvt Ltd',
    tradeName: process.env.COMPANY_TRADE_NAME || 'RF Riddhy',
    gstin: process.env.COMPANY_GSTIN || '07AAAAA0000A1Z5',
    pan: process.env.COMPANY_PAN || 'AAAAA0000A',
    state: process.env.COMPANY_STATE || 'Delhi',
    stateCode: process.env.COMPANY_STATE_CODE || '07',
    addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'Plot 42, Okhla Industrial Area Phase III',
    addressLine2: '',
    city: process.env.COMPANY_CITY || 'New Delhi',
    pincode: process.env.COMPANY_PINCODE || '110020',
    phone: process.env.COMPANY_PHONE || '+91 98765 43210',
    email: process.env.COMPANY_EMAIL || 'billing@rfriddhy.com',
    invoicePrefix: process.env.INVOICE_PREFIX || 'RF',
    invoiceTiming: process.env.INVOICE_TIMING || 'paid',
    defaultWarehouseCode: process.env.DEFAULT_WAREHOUSE_CODE || 'DELHI-01',
    currency: process.env.STORE_CURRENCY || 'INR',
    logoUrl: '',
    website: 'https://rfriddhy.com',
    bankName: 'HDFC Bank Ltd',
    accountNo: '50200012345678',
    ifsc: 'HDFC0001234',
    upiId: 'rfriddhy@hdfcbank',
    invoiceTerms: '1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. Subject to Delhi jurisdiction.',
    invoiceFooterNote: 'Thank you for choosing RF Riddhy. For support & warranty, email care@riddhy.in or WhatsApp +91 99342 08035.',
    nextInvoiceNumber: 1
  };
}

/**
 * Retrieves the current company settings from the database (or seeds from env vars).
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
        // If race condition or create fails, use seedData directly
        doc = seedData;
      }
    }

    const merged = {
      ...fallback,
      ...(doc || {})
    };

    cachedSettings = merged;
    cacheExpiry = now + CACHE_TTL_MS;
    return merged;
  } catch (error) {
    // If DB is unreachable, return fallback defaults
    return fallback;
  }
}
