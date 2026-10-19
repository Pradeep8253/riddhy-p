export const siteConfig = {
  brandName: "RF Riddhy",
  brandTagline: "Furniture & Home Appliances",
  hindiTagline: "आपके घर की समृद्धि",

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  contact: {
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    responseTime: process.env.NEXT_PUBLIC_RESPONSE_TIME_HOURS || "",
    hours: process.env.NEXT_PUBLIC_STORE_HOURS || "",
    holidaysNotice: process.env.NEXT_PUBLIC_HOLIDAYS_NOTICE || "",
  },

  // Physical showroom / store details
  showroom: {
    name: "RF Riddhy Experience Store",
    addressLine1: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
    city: process.env.NEXT_PUBLIC_STORE_CITY || "",
    state: process.env.NEXT_PUBLIC_STORE_STATE || "",
    pincode: process.env.NEXT_PUBLIC_STORE_PINCODE || "",
    country: "India",
    // External Google Maps directions URL (no embedded third-party scripts)
    mapUrl: process.env.NEXT_PUBLIC_STORE_MAP_URL || "",
    hours: process.env.NEXT_PUBLIC_STORE_HOURS || "",
  },

  // Social media presence
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
  },

  // Consultation booking settings
  consultation: {
    // Max bookings allowed per time window per day before marking slot full
    capacityPerSlot: Number(
      process.env.NEXT_PUBLIC_CONSULTATION_CAPACITY_PER_SLOT || 3,
    ),
    // Allowed consultation modes
    modes: {
      phone: true,
      video: true,
      showroom: Boolean(process.env.NEXT_PUBLIC_STORE_ADDRESS),
      home: process.env.NEXT_PUBLIC_CONSULTATION_HOME_VISIT === "true",
    },
    // Standard daily windows
    windows: [
      {
        id: "morning",
        label: "Morning",
        labelHi: "सुबह",
        time: "10:00 AM – 1:00 PM",
      },
      {
        id: "afternoon",
        label: "Afternoon",
        labelHi: "दोपहर",
        time: "2:00 PM – 5:00 PM",
      },
      {
        id: "evening",
        label: "Evening",
        labelHi: "शाम",
        time: "6:00 PM – 8:00 PM",
      },
    ],
  },

  // Story & brand proof (Only rendered if verified values exist)
  story: {
    foundedYear: process.env.NEXT_PUBLIC_FOUNDED_YEAR || "",
    originCity: process.env.NEXT_PUBLIC_ORIGIN_CITY || "",
    founderNarrative: process.env.NEXT_PUBLIC_FOUNDER_NOTE || "",
    metrics: {
      homesFurnished: process.env.NEXT_PUBLIC_METRICS_HOMES || "",
      pincodesServed: process.env.NEXT_PUBLIC_METRICS_PINCODES || "",
      satisfactionRate: process.env.NEXT_PUBLIC_METRICS_RATING || "",
    },
    partnerBrands: process.env.NEXT_PUBLIC_PARTNER_BRANDS
      ? process.env.NEXT_PUBLIC_PARTNER_BRANDS.split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [],
  },
};

/**
 * Helper to check if a value is configured and not an empty placeholder
 */
export function isConfigured(value) {
  if (!value) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && !trimmed.startsWith("TODO_REPLACE");
  }
  return true;
}

/**
 * Format a WhatsApp phone number into a click-to-chat URL
 */
export function getWhatsAppUrl(text = "") {
  const configured = siteConfig.contact.whatsapp
    ? siteConfig.contact.whatsapp.replace(/\D/g, "")
    : "";
  const number = configured || "919934208035";
  const message = encodeURIComponent(
    text || "Hello RF Riddhy, I would like to know more about your products.",
  );
  return `https://wa.me/${number}?text=${message}`;
}

/**
 * Format a telephone number into a tel: link
 */
export function getTelUrl() {
  const configured = siteConfig.contact.phone
    ? siteConfig.contact.phone.trim()
    : "";
  const phone = configured || "+91 99342 08035";
  return `tel:${phone.replace(/\s+/g, "")}`;
}

/**
 * Format a WhatsApp link with prefilled product details & specific intent
 */
export function getProductWhatsAppUrl(
  product,
  locale = "en",
  intent = "general",
) {
  if (!product) return getWhatsAppUrl();

  const baseUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : siteConfig.siteUrl || "https://rfriddhy.com";
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const priceText = product.price
    ? `₹${Number(product.price).toLocaleString("en-IN")}`
    : "";

  let message = "";
  if (locale === "hi") {
    if (intent === "photos") {
      message = `नमस्ते RF Riddhy, क्या मुझे *${product.name}* (${priceText}) की वास्तविक शोरूम तस्वीरें या वीडियो मिल सकती हैं?\n\n*लिंक:* ${productUrl}`;
    } else if (intent === "custom") {
      message = `नमस्ते RF Riddhy, क्या *${product.name}* को मेरे कमरे के अनुसार कस्टमाइज़ (साइज़ / रंग / फ़ैब्रिक) किया जा सकता है?\n\n*लिंक:* ${productUrl}`;
    } else if (intent === "discount") {
      message = `नमस्ते RF Riddhy, मैं *${product.name}* (${priceText}) ख़रीदने में रुचि रखता हूँ। कृपया सर्वोत्तम उपलब्ध ऑफ़र और छूट बताएं।\n\n*लिंक:* ${productUrl}`;
    } else {
      message =
        `नमस्ते RF Riddhy, मुझे इस प्रोडक्ट में रुचि है:\n\n` +
        `*प्रोडक्ट:* ${product.name}\n` +
        (priceText ? `*मूल्य:* ${priceText}\n` : "") +
        (product.sku ? `*SKU:* ${product.sku}\n` : "") +
        `*लिंक:* ${productUrl}\n\n` +
        `कृपया इसकी उपलब्धता, डिलीवरी और ऑर्डर प्रक्रिया की जानकारी दें। धन्यवाद!`;
    }
  } else {
    if (intent === "photos") {
      message = `Hello RF Riddhy, could you please share real showroom photos or video of *${product.name}* (${priceText})?\n\n*Link:* ${productUrl}`;
    } else if (intent === "custom") {
      message = `Hello RF Riddhy, can *${product.name}* be customized in size, fabric, or finish for my room?\n\n*Link:* ${productUrl}`;
    } else if (intent === "discount") {
      message = `Hello RF Riddhy, I am interested in purchasing *${product.name}* (${priceText}). Could you share the best festive/package offer available?\n\n*Link:* ${productUrl}`;
    } else {
      message =
        `Hello RF Riddhy, I am interested in this product:\n\n` +
        `*Product:* ${product.name}\n` +
        (priceText ? `*Price:* ${priceText}\n` : "") +
        (product.sku ? `*SKU:* ${product.sku}\n` : "") +
        `*Link:* ${productUrl}\n\n` +
        `Could you please share details regarding availability, delivery and ordering process? Thank you!`;
    }
  }

  return getWhatsAppUrl(message);
}
