/**
 * RF Riddhy — Centralized Site Configuration & Business Truth
 *
 * HARD RULE: Never invent business facts (phone, address, years in business,
 * customer count, awards, team names, partner brands). All values default to
 * clearly marked TODO_REPLACE placeholders or empty strings and read from env vars.
 *
 * If a value is unconfigured / empty, the UI must hide that section or card
 * gracefully rather than showing developer text.
 */

export const siteConfig = {
  brandName: 'RF Riddhy',
  brandTagline: 'Furniture & Home Appliances',
  hindiTagline: 'आपके घर की समृद्धि',

  // Site URL
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Customer care channels (TODO_REPLACE placeholders reading from env)
  contact: {
    // Phone support: e.g. +91 98765 43210
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '',
    // WhatsApp direct chat: e.g. 919876543210 (digits only with country code)
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '',
    // Official customer care email
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
    // Response expectation (e.g. "4 working hours", "24 hours")
    responseTime: process.env.NEXT_PUBLIC_RESPONSE_TIME_HOURS || '',
    // Weekly business hours
    hours: process.env.NEXT_PUBLIC_STORE_HOURS || '',
    // Days off / holidays notice
    holidaysNotice: process.env.NEXT_PUBLIC_HOLIDAYS_NOTICE || ''
  },

  // Physical showroom / store details
  showroom: {
    name: 'RF Riddhy Experience Store',
    addressLine1: process.env.NEXT_PUBLIC_STORE_ADDRESS || '',
    city: process.env.NEXT_PUBLIC_STORE_CITY || '',
    state: process.env.NEXT_PUBLIC_STORE_STATE || '',
    pincode: process.env.NEXT_PUBLIC_STORE_PINCODE || '',
    country: 'India',
    // External Google Maps directions URL (no embedded third-party scripts)
    mapUrl: process.env.NEXT_PUBLIC_STORE_MAP_URL || '',
    hours: process.env.NEXT_PUBLIC_STORE_HOURS || ''
  },

  // Social media presence
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || ''
  },

  // Consultation booking settings
  consultation: {
    // Max bookings allowed per time window per day before marking slot full
    capacityPerSlot: Number(process.env.NEXT_PUBLIC_CONSULTATION_CAPACITY_PER_SLOT || 3),
    // Allowed consultation modes
    modes: {
      phone: true,
      video: true,
      showroom: Boolean(process.env.NEXT_PUBLIC_STORE_ADDRESS),
      home: process.env.NEXT_PUBLIC_CONSULTATION_HOME_VISIT === 'true'
    },
    // Standard daily windows
    windows: [
      { id: 'morning', label: 'Morning', labelHi: 'सुबह', time: '10:00 AM – 1:00 PM' },
      { id: 'afternoon', label: 'Afternoon', labelHi: 'दोपहर', time: '2:00 PM – 5:00 PM' },
      { id: 'evening', label: 'Evening', labelHi: 'शाम', time: '6:00 PM – 8:00 PM' }
    ]
  },

  // Story & brand proof (Only rendered if verified values exist)
  story: {
    foundedYear: process.env.NEXT_PUBLIC_FOUNDED_YEAR || '',
    originCity: process.env.NEXT_PUBLIC_ORIGIN_CITY || '',
    founderNarrative: process.env.NEXT_PUBLIC_FOUNDER_NOTE || '',
    metrics: {
      homesFurnished: process.env.NEXT_PUBLIC_METRICS_HOMES || '',
      pincodesServed: process.env.NEXT_PUBLIC_METRICS_PINCODES || '',
      satisfactionRate: process.env.NEXT_PUBLIC_METRICS_RATING || ''
    },
    partnerBrands: process.env.NEXT_PUBLIC_PARTNER_BRANDS
      ? process.env.NEXT_PUBLIC_PARTNER_BRANDS.split(',').map((b) => b.trim()).filter(Boolean)
      : []
  }
};

/**
 * Helper to check if a value is configured and not an empty placeholder
 */
export function isConfigured(value) {
  if (!value) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 && !trimmed.startsWith('TODO_REPLACE');
  }
  return true;
}

/**
 * Format a WhatsApp phone number into a click-to-chat URL
 */
export function getWhatsAppUrl(text = '') {
  const configured = siteConfig.contact.whatsapp ? siteConfig.contact.whatsapp.replace(/\D/g, '') : '';
  const number = configured || '919934208035';
  const message = encodeURIComponent(text || 'Hello RF Riddhy, I would like to know more about your products.');
  return `https://wa.me/${number}?text=${message}`;
}

/**
 * Format a telephone number into a tel: link
 */
export function getTelUrl() {
  const configured = siteConfig.contact.phone ? siteConfig.contact.phone.trim() : '';
  const phone = configured || '+91 99342 08035';
  return `tel:${phone.replace(/\s+/g, '')}`;
}
