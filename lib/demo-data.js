import { IMG } from "./images.js";

export const CATEGORY_SEED = [
  {
    type: "furniture",
    slug: "sofas",
    name: "Sofas & Sectionals",
    room: "living",
    imageKey: "sofas",
  },
  {
    type: "furniture",
    slug: "beds",
    name: "Beds",
    room: "bedroom",
    imageKey: "beds",
  },
  {
    type: "furniture",
    slug: "wardrobes",
    name: "Wardrobes",
    room: "bedroom",
    imageKey: "wardrobes",
  },
  {
    type: "furniture",
    slug: "dining-sets",
    name: "Dining Sets",
    room: "dining",
    imageKey: "dining-sets",
  },
  {
    type: "furniture",
    slug: "study-tables",
    name: "Study & Work",
    room: "study",
    imageKey: "study-tables",
  },
  {
    type: "furniture",
    slug: "mattresses",
    name: "Mattresses",
    room: "bedroom",
    imageKey: "mattresses",
  },
  {
    type: "furniture",
    slug: "decor",
    name: "Home Décor",
    room: "living",
    imageKey: "decor",
  },
  {
    type: "furniture",
    slug: "storage",
    name: "Storage & Shelving",
    room: "living",
    imageKey: "storage",
  },
  {
    type: "appliance",
    slug: "refrigerators",
    name: "Refrigerators",
    room: "kitchen",
    imageKey: "refrigerators",
  },
  {
    type: "appliance",
    slug: "washing-machines",
    name: "Washing Machines",
    room: "kitchen",
    imageKey: "washing-machines",
  },
  {
    type: "appliance",
    slug: "air-conditioners",
    name: "Air Conditioners",
    room: "living",
    imageKey: "air-conditioners",
  },
  {
    type: "appliance",
    slug: "televisions",
    name: "Televisions",
    room: "living",
    imageKey: "televisions",
  },
  {
    type: "appliance",
    slug: "microwaves",
    name: "Microwaves",
    room: "kitchen",
    imageKey: "microwaves",
  },
  {
    type: "appliance",
    slug: "chimneys",
    name: "Kitchen Chimneys",
    room: "kitchen",
    imageKey: "chimneys",
  },
  {
    type: "appliance",
    slug: "water-purifiers",
    name: "Water Purifiers",
    room: "kitchen",
    imageKey: "water-purifiers",
  },
];

export const BRAND_SEED = [
  "Riddhy Select",
  "Veda Home",
  "Prana Living",
  "Aarohan",
];

const definitions = [
  [
    "furniture",
    "sofas",
    "sofa",
    "Sofa",
    49990,
    [
      ["Mira 3-Seater Sofa", "soft sage upholstery"],
      ["Aarav L-Shape Sectional", "roomy reversible chaise"],
      ["Nila Loveseat", "compact apartment comfort"],
    ],
  ],
  [
    "furniture",
    "beds",
    "bed",
    "Bed",
    37990,
    [
      ["Avani Queen Storage Bed", "hydraulic lift storage"],
      ["Kesar Platform Bed", "solid mango-wood frame"],
      ["Mitti Daybed", "simple guest-room style"],
    ],
  ],
  [
    "furniture",
    "wardrobes",
    "wardrobe",
    "Wardrobe",
    42990,
    [
      ["Saanvi 3-Door Wardrobe", "quiet soft-close hinges"],
      ["Nivaan Sliding Wardrobe", "space-saving sliding doors"],
      ["Arohi 2-Door Wardrobe", "thoughtful everyday storage"],
    ],
  ],
  [
    "furniture",
    "dining-sets",
    "dining",
    "Dining Set",
    32990,
    [
      ["Neem 4-Seater Dining Set", "solid-wood dining for four"],
      ["Kaira Round Dining Set", "soft-edged compact table"],
      ["Saffron 6-Seater Dining Set", "room for gathering"],
    ],
  ],
  [
    "furniture",
    "study-tables",
    "study",
    "Study Table",
    8990,
    [
      ["Sutra Study Desk", "cable-ready work surface"],
      ["Aarav Workstation", "drawer and book ledge"],
      ["Lipi Writing Table", "light, minimal footprint"],
    ],
  ],
  [
    "furniture",
    "mattresses",
    "mattress",
    "Mattress",
    11990,
    [
      ["CloudRest Ortho Mattress", "balanced medium-firm support"],
      ["Sukoon Pocket Mattress", "individually wrapped coils"],
      ["Nidra Memory Mattress", "contouring comfort layer"],
    ],
  ],
  [
    "furniture",
    "decor",
    "decor",
    "Home Décor",
    2490,
    [
      ["Aangan Accent Lamp", "warm diffused glow"],
      ["Moringa Planter Set", "hand-finished ceramic pair"],
      ["Rang Cushion Duo", "woven cotton texture"],
    ],
  ],
  [
    "furniture",
    "storage",
    "storage",
    "Storage",
    6990,
    [
      ["Katha Bookshelf", "open shelves for daily finds"],
      ["Sajilo Shoe Cabinet", "vented entryway storage"],
      ["Reva Sideboard", "closed storage with warm grain"],
    ],
  ],
  [
    "appliance",
    "refrigerators",
    "refrigerator",
    "Refrigerator",
    28990,
    [
      ["Veda 300L Frost-Free Refrigerator", "convertible cooling zones"],
      ["Prana 240L Double Door", "quiet inverter compressor"],
      ["Nivaan 190L Direct Cool", "everyday family essentials"],
    ],
  ],
  [
    "appliance",
    "washing-machines",
    "washer",
    "Washing Machine",
    19990,
    [
      ["Veda 8kg Front Load Washer", "steam care and quick cycle"],
      ["Aarohan 7kg Top Load Washer", "gentle wash, easy controls"],
      ["Prana 9kg Front Load Washer", "large-family capacity"],
    ],
  ],
  [
    "appliance",
    "air-conditioners",
    "ac",
    "Air Conditioner",
    32990,
    [
      ["Aarohan 1.5T Inverter AC", "adaptive inverter cooling"],
      ["Veda 1T Inverter AC", "quiet comfort for bedrooms"],
      ["Prana 2T Inverter AC", "high-capacity room cooling"],
    ],
  ],
  [
    "appliance",
    "televisions",
    "tv",
    "Television",
    24990,
    [
      ["Veda 55-inch 4K TV", "vivid 4K smart entertainment"],
      ["Prana 43-inch QLED TV", "rich colour in a compact size"],
      ["Aarohan 65-inch 4K TV", "cinema-scale family viewing"],
    ],
  ],
  [
    "appliance",
    "microwaves",
    "microwave",
    "Microwave",
    6990,
    [
      ["Veda 28L Convection Microwave", "bake, grill and reheat"],
      ["Prana 20L Solo Microwave", "simple everyday reheating"],
      ["Aarohan 25L Grill Microwave", "quick crisp finish"],
    ],
  ],
  [
    "appliance",
    "chimneys",
    "chimney",
    "Kitchen Chimney",
    11990,
    [
      ["Veda 90cm Auto-Clean Chimney", "wide capture with easy cleaning"],
      ["Prana 60cm Wall Chimney", "compact kitchen ventilation"],
      ["Aarohan 75cm Motion Chimney", "hands-free gesture control"],
    ],
  ],
  [
    "appliance",
    "water-purifiers",
    "purifier",
    "Water Purifier",
    8990,
    [
      ["Veda RO+UV Water Purifier", "multi-stage water care"],
      ["Prana Copper RO Purifier", "copper-enriched final stage"],
      ["Aarohan UV+UF Purifier", "compact under-sink option"],
    ],
  ],
];

const dimensions = {
  sofa: [210, 88, 82],
  bed: [160, 210, 105],
  wardrobe: [180, 58, 210],
  dining: [140, 85, 76],
  study: [120, 60, 75],
  mattress: [183, 198, 20],
  decor: [35, 35, 55],
  storage: [120, 40, 150],
  refrigerator: [60, 68, 172],
  washer: [60, 62, 85],
  ac: [90, 22, 30],
  tv: [123, 8, 72],
  microwave: [52, 45, 32],
  chimney: [90, 50, 55],
  purifier: [35, 28, 48],
};
const imageFor = {
  sofa: "sofa",
  bed: "bed",
  wardrobe: "wardrobe",
  dining: "dining",
  study: "study",
  mattress: "mattress",
  decor: "decor",
  storage: "storage",
  refrigerator: "refrigerator",
  washer: "washer",
  ac: "ac",
  tv: "tv",
  microwave: "microwave",
  chimney: "chimney",
  purifier: "purifier",
};
const discounts = [15, 18, 12];

export function getDemoProducts() {
  return definitions.flatMap(
    ([type, category, modelType, _label, base, items], groupIndex) =>
      items.map(([name, tagline], index) => {
        const price =
          Math.round(
            (base * (index === 0 ? 1 : index === 1 ? 1.24 : 0.78)) / 100,
          ) * 100;
        const discount = discounts[(groupIndex + index) % discounts.length];
        const mrp = Math.round(price / (1 - discount / 100) / 100) * 100;
        const [w, d, h] = dimensions[modelType];
        const appliance = type === "appliance";
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const categoryInfo = CATEGORY_SEED.find(
          (entry) => entry.slug === category,
        );
        return {
          id: `demo-${slug}`,
          slug,
          name,
          tagline,
          type,
          category,
          categoryLabel: categoryInfo.name,
          room: categoryInfo.room,
          brand: BRAND_SEED[(groupIndex + index) % BRAND_SEED.length],
          modelType,
          sku: `RF-${String(groupIndex + 1).padStart(2, "0")}${String(index + 1).padStart(2, "0")}-DEMO`,
          price,
          mrp,
          discount,
          stock: index === 2 && groupIndex % 4 === 0 ? 3 : 12 + index * 4,
          image: IMG.products[imageFor[modelType]],
          imageAlt: `${name} — illustrated demo product`,
          isDemoImage: true,
          dimensions: { width: w, depth: d, height: h, unit: "cm" },
          packageDimensions: {
            width: w + 12,
            depth: d + 12,
            height: h + 15,
            unit: "cm",
          },
          warranty: appliance
            ? {
                manufacturer: "1 year comprehensive",
                compressor:
                  modelType === "refrigerator" || modelType === "ac"
                    ? "10 years on compressor"
                    : null,
                seller: "30-day installation support",
              }
            : { manufacturer: null, seller: "2 years on frame and hardware" },
          gstRate: 18,
          specs: appliance
            ? {
                capacity:
                  modelType === "refrigerator"
                    ? "300 L"
                    : modelType === "washer"
                      ? "8 kg"
                      : modelType === "ac"
                        ? "1.5 ton"
                        : modelType === "tv"
                          ? "55 inch"
                          : "28 L",
                energyRating: "5 Star",
                noise: "Low-noise operation",
                finish: "Satin ivory",
              }
            : {
                material:
                  modelType === "sofa"
                    ? "Performance fabric / solid wood"
                    : "Engineered wood with natural finish",
                colour: ["Sage", "Warm oak", "Ivory"][index],
                seating: modelType === "sofa" ? "3 seater" : undefined,
                assembly: "Professional assembly available",
              },
          features: [
            tagline,
            appliance
              ? "Delivery and installation options shown at checkout"
              : "Made for everyday Indian homes",
            "Demo listing — imagery is illustrative",
          ],
          metaTitle: `${name} | RF Riddhy`,
          metaDescription: `${tagline}. Explore dimensions, delivery options and warranty details at RF Riddhy.`,
          tags:
            index === 0
              ? ["best-selling", "featured"]
              : index === 1
                ? ["popular", "trending"]
                : ["new-arrival"],
          badgeText:
            index === 0 ? "Best Seller" : index === 1 ? "Popular" : "New",
          sales30d: 40 - index * 10,
          views30d: 250 - index * 50,
          wishlistCount: 20 - index * 4,
          status: "active",
          isDemo: true,
        };
      }),
  );
}

export function getProductBySlug(slug) {
  return getDemoProducts().find((product) => product.slug === slug) || null;
}
export function getProductsByType(type) {
  return getDemoProducts().filter((product) => product.type === type);
}
export function getProductsByCategory(category) {
  return getDemoProducts().filter((product) => product.category === category);
}
export function getCategory(slug) {
  return CATEGORY_SEED.find((category) => category.slug === slug) || null;
}
export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
