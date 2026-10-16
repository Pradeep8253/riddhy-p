import { connectDB } from './db.js';
import { MarriagePackage } from '../models/index.js';
import { IMG } from './images.js';

export const defaultPackages = [
  {
    name: 'Basic Marriage Package',
    slug: 'basic-marriage-package',
    tier: 'basic',
    tagline: 'Essential furniture & home appliances for newlyweds starting a home.',
    description:
      'A thoughtfully curated starter package covering the core bedroom essentials, kitchen refrigeration, laundry care, and living entertainment.',
    bannerImage: IMG.hero.desktop,
    thumbnailImage: IMG.categories.bedroom,
    price: 89999,
    originalPrice: 115000,
    savings: 25001,
    highlightBadge: 'Essential 1-2 BHK Setup · 6 Core Items',
    categories: ['Bedroom Essentials', 'Kitchen Care', 'Home Laundry', 'Living Entertainment'],
    items: [
      {
        category: 'Bedroom Essentials',
        title: 'Queen Size Bed with Hydraulic Storage (Teak Finish)',
        quantity: 1,
        specs: 'Engineered wood + Teak laminate · 60" x 78"',
        isOptional: false
      },
      {
        category: 'Bedroom Essentials',
        title: 'High-Resilience Dual Comfort Mattress (6-inch)',
        quantity: 1,
        specs: 'Medium firm & gentle support · Breathable jacquard cover',
        isOptional: false
      },
      {
        category: 'Bedroom Essentials',
        title: '3-Door Wardrobe with Hanging Rail & Internal Lockers',
        quantity: 1,
        specs: 'Sturdy metal hinges · Scratch-resistant melamine finish',
        isOptional: false
      },
      {
        category: 'Kitchen Care',
        title: '260L Double Door Inverter Frost-Free Refrigerator',
        quantity: 1,
        specs: '3-star energy rating · Toughened glass shelves · Silent operation',
        isOptional: false
      },
      {
        category: 'Home Laundry',
        title: '7kg Fully Automatic Top Load Washing Machine',
        quantity: 1,
        specs: 'Digital inverter motor · Quick wash & gentle spin cycles',
        isOptional: false
      },
      {
        category: 'Living Entertainment',
        title: '32-inch HD Smart LED TV (Google TV / Voice Remote)',
        quantity: 1,
        specs: 'Dolby Audio · 2x HDMI, 2x USB · Pre-installed streaming apps',
        isOptional: false
      }
    ],
    customizableAddons: [
      {
        title: 'Solid Sheesham Bedside Tables (Pair)',
        category: 'Bedroom',
        price: 5999,
        description: 'Two drawer bedside companions with antique brass pulls.',
        includedByDefault: false
      },
      {
        title: '4-Seater Compact Dining Table Set',
        category: 'Dining',
        price: 12499,
        description: 'Hardwood dining table with 4 cushioned dining chairs.',
        includedByDefault: false
      },
      {
        title: 'Solo Microwave Oven (20 Liters)',
        category: 'Appliances',
        price: 6499,
        description: 'Defrost, reheat, and essential cooking with child lock.',
        includedByDefault: false
      }
    ],
    sortOrder: 1,
    active: true
  },
  {
    name: 'Premium Marriage Package',
    slug: 'premium-marriage-package',
    tier: 'premium',
    tagline: 'Complete 2-3 BHK household setup with solid wood & high-efficiency appliances.',
    description:
      'Our most requested wedding package. Fully furnishes living room, master bedroom, guest room, dining room, and equips your kitchen with premium inverter appliances.',
    bannerImage: IMG.hero.desktop,
    thumbnailImage: IMG.categories.living,
    price: 169999,
    originalPrice: 218000,
    savings: 48001,
    highlightBadge: 'Most Popular · Complete 2-3 BHK Setup · 11 Pieces',
    categories: ['Master Bedroom', 'Guest Bedroom', 'Living Room', 'Dining Room', 'Kitchen Appliances', 'Laundry Care'],
    items: [
      {
        category: 'Master Bedroom',
        title: 'Solid Sheesham Wood King Bed with Box Storage',
        quantity: 1,
        specs: 'Kiln-dried pure Sheesham · Natural honey finish · 72" x 78"',
        isOptional: false
      },
      {
        category: 'Master Bedroom',
        title: 'Orthopedic Memory Foam King Mattress (8-inch)',
        quantity: 1,
        specs: 'Pressure-relieving memory foam with cooling gel layer',
        isOptional: false
      },
      {
        category: 'Guest Bedroom',
        title: 'Queen Size Bed with Under-Bed Storage',
        quantity: 1,
        specs: 'Solid construction · Teak grain finish · 60" x 78"',
        isOptional: false
      },
      {
        category: 'Master Bedroom',
        title: '4-Door Spacious Wardrobe with Full-Length Dressing Mirror',
        quantity: 1,
        specs: 'Deep drawers, twin locker vaults, durable soft-close hinges',
        isOptional: false
      },
      {
        category: 'Living Room',
        title: '3+2 Premium Fabric Sofa Set (Solid Teak Framework)',
        quantity: 1,
        specs: 'High-density 40-density foam · Stain-resistant linen blend',
        isOptional: false
      },
      {
        category: 'Dining Room',
        title: '6-Seater Solid Sheesham Dining Table with Ergonomic Chairs',
        quantity: 1,
        specs: 'Heavy Sheesham top · 6 curved wooden backrest chairs',
        isOptional: false
      },
      {
        category: 'Kitchen Appliances',
        title: '340L Frost-Free Double Door Convertible Inverter Refrigerator',
        quantity: 1,
        specs: '14-in-1 convertible zones · Toughened glass · 3-star BEE rated',
        isOptional: false
      },
      {
        category: 'Laundry Care',
        title: '8kg AI Inverter Front Load Washing Machine with Steam Care',
        quantity: 1,
        specs: '1400 RPM · In-built heater · Hygiene steam allergen wash',
        isOptional: false
      },
      {
        category: 'Living Room',
        title: '55-inch 4K Ultra HD Smart LED TV (Bezel-less)',
        quantity: 1,
        specs: 'Dolby Vision & Atmos · MEMC smooth motion · 60Hz 4K',
        isOptional: false
      },
      {
        category: 'Kitchen Appliances',
        title: '28L Convection Microwave Oven with Tandoor / Grill Rack',
        quantity: 1,
        specs: 'Auto-cook menus · Deodorizer · Stainless steel cavity',
        isOptional: false
      },
      {
        category: 'Kitchen Appliances',
        title: 'Advanced RO + UV + UF Water Purifier with Copper Infusion',
        quantity: 1,
        specs: '8L storage tank · Multi-stage filtration suitable for high TDS',
        isOptional: false
      }
    ],
    customizableAddons: [
      {
        title: 'Solid Sheesham Coffee Table with 4 Nested Stools',
        category: 'Living',
        price: 7999,
        description: 'Center table with pull-out ottomans for extra seating.',
        includedByDefault: false
      },
      {
        title: 'Sheesham Entertainment TV Console (6-foot)',
        category: 'Living',
        price: 11999,
        description: 'Cable management slots with twin fluted glass cabinet doors.',
        includedByDefault: false
      },
      {
        title: '1.5 Ton 5-Star Inverter Split Air Conditioner (Copper Condenser)',
        category: 'Appliances',
        price: 36999,
        description: 'Dual inverter rotary compressor with PM 2.5 air filter.',
        includedByDefault: false
      }
    ],
    sortOrder: 2,
    active: true
  },
  {
    name: 'Luxury Marriage Package',
    slug: 'luxury-marriage-package',
    tier: 'luxury',
    tagline: 'Handcrafted solid teak furniture & flagship smart appliances for discerning homes.',
    description:
      'The definitive wedding collection. Handcrafted solid teak wood architecture, genuine Italian marble dining, Chesterfield seating, and flagship smart inverter appliances.',
    bannerImage: IMG.hero.desktop,
    thumbnailImage: IMG.categories.dining,
    price: 299999,
    originalPrice: 385000,
    savings: 85001,
    highlightBadge: 'Flagship Luxury · Handcrafted Teak & Smart Home Suite · 16 Pieces',
    categories: ['Master Suite', 'Guest Suite', 'Grand Living', 'Italian Marble Dining', 'Chef Kitchen', 'Smart Care'],
    items: [
      {
        category: 'Master Suite',
        title: 'Handcrafted Solid Teak Wood King Bed with Velvet Tufted Headboard',
        quantity: 1,
        specs: 'Grade-A CP Teak · Hand-rubbed wax finish · Hydraulic lift storage',
        isOptional: false
      },
      {
        category: 'Master Suite',
        title: 'Pocket Spring & Organic Latex 10-inch Hybrid Mattress',
        quantity: 1,
        specs: 'Zero-partner disturbance · Eurotop organic bamboo cover',
        isOptional: false
      },
      {
        category: 'Guest Suite',
        title: 'Solid Teak Queen Bed with Storage & Premium 8-inch Mattress',
        quantity: 1,
        specs: 'Classic minimalist lines · Matching side tables included',
        isOptional: false
      },
      {
        category: 'Master Suite',
        title: 'Modular 5-Door Armoire with Fluted Glass & Sensor Illumination',
        quantity: 1,
        specs: 'Velvet-lined jewelry trays, tie racks, soft-close Blum runners',
        isOptional: false
      },
      {
        category: 'Grand Living',
        title: 'Chesterfield 7-Seater Sectional Sofa (Deep Tufted Velvet / Leather)',
        quantity: 1,
        specs: 'Hardwood internal framing · Pocket spring core with 45D foam',
        isOptional: false
      },
      {
        category: 'Italian Marble Dining',
        title: '6-Seater Italian Botticino Marble Dining Table with Upholstered Armchairs',
        quantity: 1,
        specs: 'Chamfered edge natural marble · Brass inlay accents · Teak base',
        isOptional: false
      },
      {
        category: 'Grand Living',
        title: 'Designer Fluted Solid Teak Coffee Table & Side Table Duo',
        quantity: 1,
        specs: 'Water-resistant polyurethane finish with brushed gold trims',
        isOptional: false
      },
      {
        category: 'Grand Living',
        title: '7-foot Solid Teak Floating TV Credenza with Soundbar Shelf',
        quantity: 1,
        specs: 'Integrated cable concealment channels and fluted drawer fronts',
        isOptional: false
      },
      {
        category: 'Chef Kitchen',
        title: '592L Side-by-Side French Door Smart Inverter Refrigerator',
        quantity: 1,
        specs: 'Dual cooling cycle · In-door ice dispenser · Fingerprint-proof steel',
        isOptional: false
      },
      {
        category: 'Smart Care',
        title: '9kg Front Load Washer-Dryer Combo (Wash & Dry in One Cycle)',
        quantity: 1,
        specs: 'Steam Refresh · Wi-Fi smart diagnosis · Ultra-quiet brushless motor',
        isOptional: false
      },
      {
        category: 'Grand Living',
        title: '65-inch OLED 4K Cinema TV with Dolby Vision IQ & Dolby Atmos',
        quantity: 1,
        specs: 'Self-lit pixels · Infinite contrast · 120Hz refresh · Smart AI processor',
        isOptional: false
      },
      {
        category: 'Chef Kitchen',
        title: '14 Place Settings Built-in / Freestanding Smart Dishwasher',
        quantity: 1,
        specs: 'Intensive 70°C hygiene wash · Cutlery tray · Half-load water saver',
        isOptional: false
      },
      {
        category: 'Chef Kitchen',
        title: '32L Convection Smart Oven with Air Fry & Fermentation Mode',
        quantity: 1,
        specs: 'Ceramic enamel interior · 100 auto-cook recipes',
        isOptional: false
      },
      {
        category: 'Chef Kitchen',
        title: 'Touch Control Dual Induction Cooktop & Smart Auto-Clean Chimney Set',
        quantity: 1,
        specs: 'Filterless chimney · Gesture motion sensor · 1350 m3/hr suction',
        isOptional: false
      }
    ],
    customizableAddons: [
      {
        title: 'Dual Motor Power Recliner Lounge Chair (Pair)',
        category: 'Living',
        price: 29999,
        description: 'Independent headrest & footrest reclining with USB charging port.',
        includedByDefault: false
      },
      {
        title: 'HEPA Smart Air Purifier & Humidifier System',
        category: 'Appliances',
        price: 14999,
        description: 'True HEPA H13 filter with real-time AQI indicator & app control.',
        includedByDefault: false
      },
      {
        title: 'Smart Laser Navigation Robot Vacuum & Mopping System',
        category: 'Smart Home',
        price: 24999,
        description: 'LiDAR mapping, auto-empty dock, and customized room mopping.',
        includedByDefault: false
      }
    ],
    sortOrder: 3,
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
    const docs = await MarriagePackage.find({ active: true }).sort({ sortOrder: 1, price: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(serializePackage);
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
    const doc = await MarriagePackage.findOne({ slug, active: true }).lean();
    if (doc) {
      return serializePackage(doc);
    }
  } catch (err) {
    // Fallback
  }
  const fallback = defaultPackages.find((pkg) => pkg.slug === slug);
  return fallback ? serializePackage(fallback) : null;
}
