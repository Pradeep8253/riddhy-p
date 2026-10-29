export const SITE_URL = 'https://www.riddhyfurnitures.in';

export const BUSINESS_INFO = {
  name: 'Riddhy Furnitures',
  alternateName: 'RF Riddhy',
  legalName: 'Riddhy Furnitures and Home Appliances',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512x512.png`,
  image: `${SITE_URL}/images/og-image.webp`,
  telephone: '+91 88402 45188',
  email: 'riddhyfurnitureshomeappliances@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mansoorabad, Near GT Road',
    addressLocality: 'Prayagraj',
    addressRegion: 'Uttar Pradesh',
    postalCode: '229411',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.4384,
    longitude: 81.7582,
  },
  hasMap:
    'https://www.google.com/maps/search/?api=1&query=Riddhy+Furnitures+Mansoorabad+Prayagraj+Uttar+Pradesh+229411',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '20:30',
    },
  ],
  priceRange: '₹₹ - ₹₹₹',
  paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, Net Banking, EMI',
  currenciesAccepted: 'INR',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Prayagraj' },
    { '@type': 'AdministrativeArea', name: 'Mansoorabad' },
    { '@type': 'AdministrativeArea', name: 'Phulpur' },
    { '@type': 'AdministrativeArea', name: 'Handia' },
    { '@type': 'AdministrativeArea', name: 'Jhusi' },
    { '@type': 'AdministrativeArea', name: 'Naini' },
    { '@type': 'AdministrativeArea', name: 'Civil Lines Prayagraj' },
    { '@type': 'AdministrativeArea', name: 'Kaushambi' },
    { '@type': 'AdministrativeArea', name: 'Varanasi' },
    { '@type': 'AdministrativeArea', name: 'Uttar Pradesh' },
  ],
  sameAs: [
    'https://www.facebook.com/riddhyfurnitures',
    'https://www.instagram.com/riddhyfurnitures',
  ],
};

export function getCanonicalUrl(path = '') {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  image = '/images/og-image.webp',
  keywords = [],
  noindex = false,
}) {
  const canonical = getCanonicalUrl(path);
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  return {
    title,
    description,
    keywords: keywords.length
      ? keywords
      : [
          'furniture shop in Prayagraj',
          'furniture showroom in Prayagraj',
          'furniture shop in Mansoorabad',
          'sofa shop in Prayagraj',
          'double bed in Prayagraj',
          'wedding furniture packages in Prayagraj',
          'home appliances in Prayagraj',
          'kitchen utensils in Prayagraj',
          'Riddhy Furnitures',
          'RF Riddhy',
        ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      siteName: 'Riddhy Furnitures',
      title,
      description,
      url: canonical,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

export function getFurnitureStoreSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['FurnitureStore', 'HomeGoodsStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#store`,
    name: BUSINESS_INFO.name,
    alternateName: BUSINESS_INFO.alternateName,
    legalName: BUSINESS_INFO.legalName,
    url: BUSINESS_INFO.url,
    logo: BUSINESS_INFO.logo,
    image: BUSINESS_INFO.image,
    telephone: BUSINESS_INFO.telephone,
    email: BUSINESS_INFO.email,
    address: BUSINESS_INFO.address,
    geo: BUSINESS_INFO.geo,
    hasMap: BUSINESS_INFO.hasMap,
    openingHoursSpecification: BUSINESS_INFO.openingHoursSpecification,
    priceRange: BUSINESS_INFO.priceRange,
    paymentAccepted: BUSINESS_INFO.paymentAccepted,
    currenciesAccepted: BUSINESS_INFO.currenciesAccepted,
    areaServed: BUSINESS_INFO.areaServed,
    sameAs: BUSINESS_INFO.sameAs,
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Riddhy Furnitures',
    alternateName: 'RF Riddhy',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http')
        ? item.url
        : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

export function getProductSchema(product) {
  if (!product) return null;
  const canonicalUrl = `${SITE_URL}/product/${product.slug}`;
  const price = Number(product.price || 0);
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => (img.startsWith('http') ? img : `${SITE_URL}${img}`))
      : [
          product.image?.startsWith('http')
            ? product.image
            : `${SITE_URL}${product.image || '/images/og-image.webp'}`,
        ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: product.name,
    description:
      product.description ||
      product.tagline ||
      `${product.name} from Riddhy Furnitures Prayagraj. Solid wood construction, free doorstep delivery in Prayagraj & Mansoorabad with 10-year warranty.`,
    image: images,
    sku: product.sku || `RF-${String(product._id || product.id || '').slice(-6).toUpperCase()}`,
    category: product.categoryLabel || product.category,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Riddhy Furnitures',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: '2027-12-31',
      availability:
        (product.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'FurnitureStore',
        name: BUSINESS_INFO.name,
        telephone: BUSINESS_INFO.telephone,
        address: BUSINESS_INFO.address,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
          addressRegion: 'Uttar Pradesh',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
        },
      },
    },
  };
}

export function getItemListSchema(items = [], title = 'Products', description = '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: items.slice(0, 30).map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        url: `${SITE_URL}/product/${item.slug}`,
        image: item.image?.startsWith('http') ? item.image : `${SITE_URL}${item.image || '/images/og-image.webp'}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: Number(item.price || 0),
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
}

export function getFaqSchema(faqs = []) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
