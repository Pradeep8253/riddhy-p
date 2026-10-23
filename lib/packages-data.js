import { connectDB } from './db.js';
import { MarriagePackage } from '../models/index.js';

export const defaultPackages = [
  {
    name: 'Shagun Package',
    hindiName: 'शगुन पैकेज',
    slug: 'shagun-package',
    tier: 'shagun',
    tagline: 'Complete 15-item starter package for newly married couples.',
    badgeText: 'सपनों का पूरा सामान एक ही पैकेज में',
    description:
      'Our most accessible starter suite featuring 15 essential pieces: double bed, dressing table, 32" Smart LED TV, steel almirah, storage trunks, dining set, and appliances.',
    bannerImage: '/images/packages/package-basic-marriage.webp',
    thumbnailImage: '/images/packages/package-basic-thumb.webp',
    price: 49999,
    originalPrice: 65000,
    savings: 15001,
    highlightBadge: 'Starter Essential · 15 Items Included',
    categories: ['Bedroom Suite', 'Storage & Trunks', 'Living & Dining', 'Home Appliances', 'Bedding & Comfort'],
    items: [
      { category: 'Bedroom Suite', title: 'Double Bed', quantity: 1, specs: 'Sturdy solid timber & engineered wood design' },
      { category: 'Bedroom Suite', title: 'Dressing Table (Shringardan)', quantity: 1, specs: 'Full-length mirror with cosmetics storage drawer' },
      { category: 'Storage & Trunks', title: 'Triveni Gold Steel Almirah', quantity: 1, specs: 'Heavy gauge steel with safety locker & mirror' },
      { category: 'Storage & Trunks', title: 'Metal Storage Trunk (Baksa)', quantity: 1, specs: '5 Feet heavy-duty galvanized trunk' },
      { category: 'Storage & Trunks', title: 'Storage Box / Peti', quantity: 1, specs: '32 Inch reinforced metal box' },
      { category: 'Living & Dining', title: 'Dining / Multi-purpose Table', quantity: 1, specs: 'Sturdy wooden table for meals & study' },
      { category: 'Living & Dining', title: 'Comfort Dining Chairs', quantity: 4, specs: 'High-back ergonomic cushioned chairs' },
      { category: 'Home Appliances', title: '32-Inch Smart HD LED TV', quantity: 1, specs: 'HD ready, HDMI/USB, preloaded smart apps' },
      { category: 'Home Appliances', title: 'Multi-Jar Mixer Grinder', quantity: 1, specs: 'Heavy duty motor with 3 stainless steel jars' },
      { category: 'Home Appliances', title: 'Electric Iron (Press)', quantity: 1, specs: 'Non-stick coated soleplate with heat control' },
      { category: 'Bedding & Comfort', title: 'High-Resilience Mattresses (Gadda)', quantity: 2, specs: 'Supportive dual-comfort sleeping mattresses' },
      { category: 'Bedding & Comfort', title: 'Sleeping Pillows (Takiya)', quantity: 2, specs: 'Soft micro-fiber filled pillows' },
      { category: 'Bedding & Comfort', title: 'Cotton Pillow Covers', quantity: 2, specs: 'Matching pure cotton covers' },
      { category: 'Bedding & Comfort', title: 'Winter Quilt / Comforter (Rajai)', quantity: 1, specs: 'Warm, lightweight micro-fill winter quilt' },
      { category: 'Bedding & Comfort', title: 'Designer Double Bedsheet', quantity: 1, specs: 'Premium cotton floral bedsheet with pillow cases' }
    ],
    customizableAddons: [
      { title: 'Pair of Solid Teak Bedside Tables', category: 'Bedroom', price: 3999, description: 'Dual drawer nightstands.' },
      { title: 'Ceiling Fan (1200mm High Speed)', category: 'Appliances', price: 2199, description: 'Energy-saving copper motor fan.' }
    ],
    sortOrder: 1,
    active: true
  },
  {
    name: 'Lagan Package',
    hindiName: 'लग्न पैकेज',
    slug: 'lagan-package',
    tier: 'lagan',
    tagline: 'Upgraded 17-item suite including a full 5-Seater Sofa Set and Center Table.',
    badgeText: 'लिविंग और बेडरूम का संपूर्ण सेटअप',
    description:
      'Adds a luxurious 5-seater sofa set and wooden center table to the full bedroom suite, 32" Smart TV, Triveni Gold almirah, storage trunks, and appliances.',
    bannerImage: '/images/packages/package-premium-marriage.webp',
    thumbnailImage: '/images/packages/package-premium-thumb.webp',
    price: 59999,
    originalPrice: 78000,
    savings: 18001,
    highlightBadge: 'With 5-Seater Sofa Set · 17 Items Included',
    categories: ['Living Room Suite', 'Bedroom Suite', 'Storage & Trunks', 'Home Appliances', 'Bedding & Comfort'],
    items: [
      { category: 'Living Room Suite', title: '5-Seater Designer Sofa Set (3+1+1)', quantity: 1, specs: 'High-density foam with premium fabric upholstery' },
      { category: 'Living Room Suite', title: 'Wooden Center Table', quantity: 1, specs: 'Matching coffee table with lower utility shelf' },
      { category: 'Bedroom Suite', title: 'Double Bed', quantity: 1, specs: 'Reinforced headboard with natural wood grain finish' },
      { category: 'Bedroom Suite', title: 'Dressing Table (Shringardan)', quantity: 1, specs: 'Full-length mirror with cosmetics storage' },
      { category: 'Storage & Trunks', title: 'Triveni Gold Steel Almirah', quantity: 1, specs: 'Heavy gauge steel with safety locker & mirror' },
      { category: 'Storage & Trunks', title: 'Metal Storage Trunk (Baksa)', quantity: 1, specs: '5 Feet heavy-duty galvanized trunk' },
      { category: 'Storage & Trunks', title: 'Storage Box / Peti', quantity: 1, specs: '32 Inch reinforced metal box' },
      { category: 'Living & Dining', title: 'Dining / Multi-purpose Table', quantity: 1, specs: 'Sturdy wooden table for meals & study' },
      { category: 'Living & Dining', title: 'Comfort Dining Chairs', quantity: 4, specs: 'High-back ergonomic cushioned chairs' },
      { category: 'Home Appliances', title: '32-Inch Smart HD LED TV', quantity: 1, specs: 'HD ready, HDMI/USB, preloaded smart apps' },
      { category: 'Home Appliances', title: 'Multi-Jar Mixer Grinder', quantity: 1, specs: 'Heavy duty motor with 3 stainless steel jars' },
      { category: 'Home Appliances', title: 'Electric Iron (Press)', quantity: 1, specs: 'Non-stick coated soleplate with heat control' },
      { category: 'Bedding & Comfort', title: 'High-Resilience Mattresses (Gadda)', quantity: 2, specs: 'Supportive dual-comfort sleeping mattresses' },
      { category: 'Bedding & Comfort', title: 'Sleeping Pillows (Takiya)', quantity: 2, specs: 'Soft micro-fiber filled pillows' },
      { category: 'Bedding & Comfort', title: 'Cotton Pillow Covers', quantity: 2, specs: 'Matching pure cotton covers' },
      { category: 'Bedding & Comfort', title: 'Winter Quilt / Comforter (Rajai)', quantity: 1, specs: 'Warm, lightweight micro-fill winter quilt' },
      { category: 'Bedding & Comfort', title: 'Designer Double Bedsheet', quantity: 1, specs: 'Premium cotton floral bedsheet with pillow cases' }
    ],
    customizableAddons: [
      { title: 'Extra 2-Seater Ottoman Poufs', category: 'Living', price: 2499, description: 'Cushioned matching footstools.' },
      { title: 'Ceiling Fan (1200mm High Speed)', category: 'Appliances', price: 2199, description: 'Energy-saving copper motor fan.' }
    ],
    sortOrder: 2,
    active: true
  },
  {
    name: 'Kanyadaan Package',
    hindiName: 'कन्यादान पैकेज',
    slug: 'kanyadaan-package',
    tier: 'kanyadaan',
    tagline: 'Complete 18-item package with 5-Seater Sofa, 32" TV and 175L Refrigerator.',
    badgeText: 'सोफा + फ्रिज + टीवी का संपूर्ण मेल',
    description:
      'A widely chosen comprehensive wedding collection. Integrates a branded 175L refrigerator alongside the full 5-seater sofa set, 32" Smart TV, bedroom suite, and trunks.',
    bannerImage: '/images/packages/package-basic-marriage.webp',
    thumbnailImage: '/images/packages/package-basic-thumb.webp',
    price: 69999,
    originalPrice: 92000,
    savings: 22001,
    highlightBadge: 'Includes 175L Refrigerator · 18 Items Included',
    categories: ['Kitchen Care', 'Living Room Suite', 'Bedroom Suite', 'Storage & Trunks', 'Home Appliances', 'Bedding & Comfort'],
    items: [
      { category: 'Kitchen Care', title: 'Direct Cool Refrigerator (175 Liters)', quantity: 1, specs: 'Star rated, toughened glass shelves, fast ice-making' },
      { category: 'Living Room Suite', title: '5-Seater Designer Sofa Set (3+1+1)', quantity: 1, specs: 'High-density foam with premium fabric upholstery' },
      { category: 'Living Room Suite', title: 'Wooden Center Table', quantity: 1, specs: 'Matching coffee table with lower utility shelf' },
      { category: 'Bedroom Suite', title: 'Double Bed', quantity: 1, specs: 'Reinforced headboard with natural wood grain finish' },
      { category: 'Bedroom Suite', title: 'Dressing Table (Shringardan)', quantity: 1, specs: 'Full-length mirror with cosmetics storage' },
      { category: 'Storage & Trunks', title: 'Triveni Gold Steel Almirah', quantity: 1, specs: 'Heavy gauge steel with safety locker & mirror' },
      { category: 'Storage & Trunks', title: 'Metal Storage Trunk (Baksa)', quantity: 1, specs: '5 Feet heavy-duty galvanized trunk' },
      { category: 'Storage & Trunks', title: 'Storage Box / Peti', quantity: 1, specs: '32 Inch reinforced metal box' },
      { category: 'Living & Dining', title: 'Dining / Multi-purpose Table', quantity: 1, specs: 'Sturdy wooden table for meals & study' },
      { category: 'Living & Dining', title: 'Comfort Dining Chairs', quantity: 4, specs: 'High-back ergonomic cushioned chairs' },
      { category: 'Home Appliances', title: '32-Inch Smart HD LED TV', quantity: 1, specs: 'HD ready, HDMI/USB, preloaded smart apps' },
      { category: 'Home Appliances', title: 'Multi-Jar Mixer Grinder', quantity: 1, specs: 'Heavy duty motor with 3 stainless steel jars' },
      { category: 'Home Appliances', title: 'Electric Iron (Press)', quantity: 1, specs: 'Non-stick coated soleplate with heat control' },
      { category: 'Bedding & Comfort', title: 'High-Resilience Mattresses (Gadda)', quantity: 2, specs: 'Supportive dual-comfort sleeping mattresses' },
      { category: 'Bedding & Comfort', title: 'Sleeping Pillows (Takiya)', quantity: 2, specs: 'Soft micro-fiber filled pillows' },
      { category: 'Bedding & Comfort', title: 'Cotton Pillow Covers', quantity: 2, specs: 'Matching pure cotton covers' },
      { category: 'Bedding & Comfort', title: 'Winter Quilt / Comforter (Rajai)', quantity: 1, specs: 'Warm, lightweight micro-fill winter quilt' },
      { category: 'Bedding & Comfort', title: 'Designer Double Bedsheet', quantity: 1, specs: 'Premium cotton floral bedsheet with pillow cases' }
    ],
    customizableAddons: [
      { title: 'Desert Air Cooler (Summercool)', category: 'Appliances', price: 6999, description: 'High air delivery desert cooler.' },
      { title: 'RO Water Purifier (10L)', category: 'Appliances', price: 5999, description: 'Multi-stage RO+UV filtration.' }
    ],
    sortOrder: 3,
    active: true
  },
  {
    name: 'Griha Lakshmi Package',
    hindiName: 'गृह लक्ष्मी पैकेज',
    slug: 'griha-lakshmi-package',
    tier: 'griha-lakshmi',
    tagline: 'Comprehensive 20-item household collection with Air Cooler & Bakhor cabinet.',
    badgeText: 'घर की हर जरूरत एक ही पैकेज में',
    description:
      'Everything a home requires in one package. Adds a Summercool Desert Air Cooler and dedicated Bakhor storage cabinet alongside refrigerator, 32" TV, sofa set and full bedroom setup.',
    bannerImage: '/images/packages/package-premium-marriage.webp',
    thumbnailImage: '/images/packages/package-premium-thumb.webp',
    price: 79999,
    originalPrice: 105000,
    savings: 25001,
    highlightBadge: 'With Air Cooler & Fridge · 20 Items Included',
    categories: ['Climate & Kitchen', 'Living Room Suite', 'Bedroom Suite', 'Storage & Trunks', 'Home Appliances', 'Bedding & Comfort'],
    items: [
      { category: 'Climate & Kitchen', title: 'Summercool Desert Air Cooler', quantity: 1, specs: 'Heavy-duty blower, motorized louvers, inverter-compatible' },
      { category: 'Climate & Kitchen', title: 'Branded Direct Cool Refrigerator', quantity: 1, specs: '175-190L capacity, energy-saving compressor' },
      { category: 'Storage & Trunks', title: 'Bakhor Multi-tier Storage Cabinet', quantity: 1, specs: 'Dedicated household organization cabinet' },
      { category: 'Living Room Suite', title: '5-Seater Designer Sofa Set (3+1+1)', quantity: 1, specs: 'High-density foam with premium fabric upholstery' },
      { category: 'Living Room Suite', title: 'Wooden Center Table', quantity: 1, specs: 'Matching coffee table with lower utility shelf' },
      { category: 'Bedroom Suite', title: 'Double Bed', quantity: 1, specs: 'Reinforced headboard with natural wood grain finish' },
      { category: 'Bedroom Suite', title: 'Dressing Table (Shringardan)', quantity: 1, specs: 'Full-length mirror with cosmetics storage' },
      { category: 'Storage & Trunks', title: 'Triveni Gold Steel Almirah', quantity: 1, specs: 'Heavy gauge steel with safety locker & mirror' },
      { category: 'Storage & Trunks', title: 'Metal Storage Trunk (Baksa)', quantity: 1, specs: '5 Feet heavy-duty galvanized trunk' },
      { category: 'Storage & Trunks', title: 'Storage Box / Peti', quantity: 1, specs: '32 Inch reinforced metal box' },
      { category: 'Living & Dining', title: 'Dining / Multi-purpose Table', quantity: 1, specs: 'Sturdy wooden table for meals & study' },
      { category: 'Living & Dining', title: 'Comfort Dining Chairs', quantity: 4, specs: 'High-back ergonomic cushioned chairs' },
      { category: 'Home Appliances', title: '32-Inch Smart HD LED TV', quantity: 1, specs: 'HD ready, HDMI/USB, preloaded smart apps' },
      { category: 'Home Appliances', title: 'Multi-Jar Mixer Grinder', quantity: 1, specs: 'Heavy duty motor with 3 stainless steel jars' },
      { category: 'Home Appliances', title: 'Electric Iron (Press)', quantity: 1, specs: 'Non-stick coated soleplate with heat control' },
      { category: 'Bedding & Comfort', title: 'High-Resilience Mattresses (Gadda)', quantity: 2, specs: 'Supportive dual-comfort sleeping mattresses' },
      { category: 'Bedding & Comfort', title: 'Sleeping Pillows (Takiya)', quantity: 2, specs: 'Soft micro-fiber filled pillows' },
      { category: 'Bedding & Comfort', title: 'Cotton Pillow Covers', quantity: 2, specs: 'Matching pure cotton covers' },
      { category: 'Bedding & Comfort', title: 'Winter Quilt / Comforter (Rajai)', quantity: 1, specs: 'Warm, lightweight micro-fill winter quilt' },
      { category: 'Bedding & Comfort', title: 'Designer Double Bedsheet', quantity: 1, specs: 'Premium cotton floral bedsheet with pillow cases' }
    ],
    customizableAddons: [
      { title: '7kg Washing Machine Upgrade', category: 'Laundry', price: 9999, description: 'Semi/fully-automatic washing machine.' },
      { title: 'Microwave Oven (20L)', category: 'Kitchen', price: 5499, description: 'Solo microwave oven for quick reheating.' }
    ],
    sortOrder: 4,
    active: true
  },
  {
    name: 'Bhagya Shree Package',
    hindiName: 'भाग्य श्री पैकेज',
    slug: 'bhagya-shree-package',
    tier: 'bhagya-shree',
    tagline: 'The ultimate 21-item all-inclusive flagship package with Washing Machine.',
    badgeText: 'वॉशिंग मशीन + कूलर + फ्रिज + सोफा + टीवी — संपूर्ण पैकेज',
    description:
      'Our most complete flagship package. Includes 7kg washing machine, Summercool cooler, 175L refrigerator, 32" Smart TV, 5-seater sofa set, full bedroom setup, Bakhor, trunks, and kitchen appliances.',
    bannerImage: '/images/packages/package-luxury-marriage.webp',
    thumbnailImage: '/images/packages/package-luxury-thumb.webp',
    price: 89999,
    originalPrice: 122000,
    savings: 32001,
    highlightBadge: 'All-Inclusive Flagship · 21 Items Included',
    categories: ['Laundry Care', 'Climate & Kitchen', 'Living Room Suite', 'Bedroom Suite', 'Storage & Trunks', 'Home Appliances', 'Bedding & Comfort'],
    items: [
      { category: 'Laundry Care', title: 'Washing Machine (7 Kg Capacity)', quantity: 1, specs: 'Powerful pulsator wash, gentle spin, lint filter' },
      { category: 'Climate & Kitchen', title: 'Summercool Desert Air Cooler', quantity: 1, specs: 'Heavy-duty blower, motorized louvers, inverter-compatible' },
      { category: 'Climate & Kitchen', title: 'Branded Direct Cool Refrigerator (175L)', quantity: 1, specs: 'Star rated, toughened glass shelves, fast cooling' },
      { category: 'Storage & Trunks', title: 'Bakhor Multi-tier Storage Cabinet', quantity: 1, specs: 'Dedicated household organization cabinet' },
      { category: 'Living Room Suite', title: '5-Seater Designer Sofa Set (3+1+1)', quantity: 1, specs: 'High-density foam with premium fabric upholstery' },
      { category: 'Living Room Suite', title: 'Wooden Center Table', quantity: 1, specs: 'Matching coffee table with lower utility shelf' },
      { category: 'Bedroom Suite', title: 'Double Bed', quantity: 1, specs: 'Reinforced headboard with natural wood grain finish' },
      { category: 'Bedroom Suite', title: 'Dressing Table (Shringardan)', quantity: 1, specs: 'Full-length mirror with cosmetics storage' },
      { category: 'Storage & Trunks', title: 'Triveni Gold Steel Almirah', quantity: 1, specs: 'Heavy gauge steel with safety locker & mirror' },
      { category: 'Storage & Trunks', title: 'Metal Storage Trunk (Baksa)', quantity: 1, specs: '5 Feet heavy-duty galvanized trunk' },
      { category: 'Storage & Trunks', title: 'Storage Box / Peti', quantity: 1, specs: '32 Inch reinforced metal box' },
      { category: 'Living & Dining', title: 'Dining / Multi-purpose Table', quantity: 1, specs: 'Sturdy wooden table for meals & study' },
      { category: 'Living & Dining', title: 'Comfort Dining Chairs', quantity: 4, specs: 'High-back ergonomic cushioned chairs' },
      { category: 'Home Appliances', title: '32-Inch Smart HD LED TV', quantity: 1, specs: 'HD ready, HDMI/USB, preloaded smart apps' },
      { category: 'Home Appliances', title: 'Multi-Jar Mixer Grinder', quantity: 1, specs: 'Heavy duty motor with 3 stainless steel jars' },
      { category: 'Home Appliances', title: 'Electric Iron (Press)', quantity: 1, specs: 'Non-stick coated soleplate with heat control' },
      { category: 'Bedding & Comfort', title: 'High-Resilience Mattresses (Gadda)', quantity: 2, specs: 'Supportive dual-comfort sleeping mattresses' },
      { category: 'Bedding & Comfort', title: 'Sleeping Pillows (Takiya)', quantity: 2, specs: 'Soft micro-fiber filled pillows' },
      { category: 'Bedding & Comfort', title: 'Cotton Pillow Covers', quantity: 2, specs: 'Matching pure cotton covers' },
      { category: 'Bedding & Comfort', title: 'Winter Quilt / Comforter (Rajai)', quantity: 1, specs: 'Warm, lightweight micro-fill winter quilt' },
      { category: 'Bedding & Comfort', title: 'Designer Double Bedsheet', quantity: 1, specs: 'Premium cotton floral bedsheet with pillow cases' }
    ],
    customizableAddons: [
      { title: '43-Inch 4K Smart TV Upgrade', category: 'Entertainment', price: 9999, description: 'Upgrade from 32" to 43" 4K Ultra HD TV.' },
      { title: 'Double Door Frost-Free Fridge Upgrade', category: 'Kitchen', price: 8499, description: 'Upgrade to 260L double door frost-free refrigerator.' }
    ],
    sortOrder: 5,
    active: true
  }
];

/**
 * Ensure package document is a plain JSON-serializable object for Next.js Client Components
 */
export function serializePackage(doc) {
  if (!doc) return null;
  const plain = JSON.parse(JSON.stringify(doc));
  return {
    ...plain,
    id: String(plain._id || plain.id || '')
  };
}

/**
 * Fetch all active packages from MongoDB with graceful fallback to defaultPackages
 */
export async function getLivePackages() {
  try {
    await connectDB();
    const count = await MarriagePackage.countDocuments();
    if (count > 0) {
      const docs = await MarriagePackage.find({ active: true }).sort({ sortOrder: 1, price: 1 }).lean();
      if (docs && docs.length >= 5) {
        return (docs || []).map(serializePackage);
      }
    }
  } catch (err) {
    // Database unconfigured or offline -> fallback to default packages
  }
  return defaultPackages.map(serializePackage);
}

/**
 * Fetch a single package by slug
 */
export async function getLivePackageBySlug(slug) {
  try {
    await connectDB();
    const count = await MarriagePackage.countDocuments();
    if (count > 0) {
      const doc = await MarriagePackage.findOne({ slug, active: true }).lean();
      if (doc) return serializePackage(doc);
    }
  } catch (err) {
    // Fallback
  }
  const fallback = defaultPackages.find((pkg) => pkg.slug === slug);
  return fallback ? serializePackage(fallback) : null;
}
