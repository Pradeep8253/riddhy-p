import { IMG } from "./images.js";
import { CATEGORIES } from "../config/categories.js";
import productGalleriesMap from "./product-galleries-map.json" with { type: "json" };

export const CATEGORY_SEED = CATEGORIES;

export const BRAND_SEED = [
  "Riddhy Select",
  "Veda Home",
  "Prana Living",
  "Aarohan",
  "Hawkins",
  "Prestige",
  "Milton",
  "Supreme",
  "Nilkamal",
];

const definitions = [
  // ===================== FURNITURE (User Specified 20 Categories) =====================
  [
    "furniture",
    "double-bed",
    "double-bed",
    "Double Bed",
    38990,
    [
      ["Royal Teak King Double Bed with Hydraulic Storage", "spacious under-bed hydraulic storage and hand-polished teak finish"],
      ["Avani Sheesham Wood Queen Double Bed", "solid timber grain with reinforced ergonomic backboard"],
      ["Kesar Low-Profile Minimalist Double Bed", "sturdy engineered wood with warm honey oak finish"],
    ],
  ],
  [
    "furniture",
    "sringardan",
    "sringardan",
    "Sringardan",
    14990,
    [
      ["Noor Sheesham Wood Shringardan with LED Mirror", "full-length dressing vanity with jewelry and cosmetics organizer"],
      ["Apsara Traditional Dressing Table with Bangle Drawers", "velvet-lined storage compartments with crystal clear mirror"],
      ["Royal Heritage Carved Shringardan Vanity", "artisan floral hand-carved accents in antique walnut"],
    ],
  ],
  [
    "furniture",
    "sofa-set",
    "sofa-set",
    "Sofa Set",
    49990,
    [
      ["Maharaja 5-Seater Royal Sofa Set (3+1+1)", "high-density 32D foam with stain-resistant velvet upholstery"],
      ["Aarav L-Shape Sectional Living Sofa Set", "spacious reversible chaise lounge for modern family comfort"],
      ["Nila 3-Seater Urban Solid Wood Sofa", "compact apartment profile with breathable linen fabric"],
    ],
  ],
  [
    "furniture",
    "centre-table",
    "centre-table",
    "Centre Table",
    7990,
    [
      ["Veda Sheesham Wood Carved Centre Table", "toughened bevelled glass top with bottom magazine shelf"],
      ["Aarohan Oval Wooden Coffee & Centre Table", "soft organic contours in warm roasted teak"],
      ["Prana Dual-Tier Living Room Centre Table", "contemporary storage layout with brass metal accents"],
    ],
  ],
  [
    "furniture",
    "wooden-wordrobe",
    "wooden-wordrobe",
    "Wooden Wardrobe",
    44990,
    [
      ["Saanvi 4-Door Teak Wood Wardrobe", "full-length mirror, secret locker and soft-close German hinges"],
      ["Nivaan Sliding Door Solid Wood Wardrobe", "smooth ball-bearing sliding track for space-saving bedrooms"],
      ["Arohi 3-Door Sheesham Wardrobe", "spacious hanging rail and four deep modular drawers"],
    ],
  ],
  [
    "furniture",
    "almirah",
    "almirah",
    "Almirah",
    18990,
    [
      ["Triveni Gold Heavy-Gauge Steel Almirah", "anti-theft safety locker, bangle tray and crystal mirror"],
      ["Riddhy Supreme Double Door Steel Almirah", "powder-coated scratch-resistant heavy gauge body"],
      ["Classic 2-Door Iron Household Almirah", "durable welded construction with high security dual locks"],
    ],
  ],
  [
    "furniture",
    "fancy-almirah",
    "fancy-almirah",
    "Fancy Almirah",
    26990,
    [
      ["Rajputana Hand-Carved Royal Fancy Almirah", "ornate bridal patterns with dual-tone antique polish"],
      ["Decora Laser-Cut Decorative Glass Almirah", "frosted tinted glass panelling with LED interior lighting"],
      ["Shahi Gold Embossed Dual-Tone Fancy Almirah", "regal metallic borders with royal bridal crest"],
    ],
  ],
  [
    "furniture",
    "mattress",
    "mattress",
    "Mattress",
    12990,
    [
      ["CloudRest Orthopaedic Dual-Comfort Mattress", "pocket spring support with breathable knitted jacquard top"],
      ["Sukoon High-Density Coir & Foam Mattress", "balanced firm spine alignment for restorative rest"],
      ["Nidra Memory Foam 8-Inch Double Mattress", "body-contouring zero motion transfer comfort layer"],
    ],
  ],
  [
    "furniture",
    "rajai",
    "rajai",
    "Rajai",
    3490,
    [
      ["Jaipuri Pure Cotton Handblock Double Rajai", "feather-light pure carded cotton filling for winter warmth"],
      ["Kashmir Micro-Flannel Thermal Winter Rajai", "plush double-sided fleece with gold piped edges"],
      ["Heritage Velvet Embroidered Bridal Rajai", "royal bridal wedding quilt with zari thread motifs"],
    ],
  ],
  [
    "furniture",
    "blanket",
    "blanket",
    "Blanket",
    2990,
    [
      ["Signature 2-Ply Heavy Embossed Mink Double Blanket", "ultra-plush Korean mink fibers with floral embossing"],
      ["Polar Soft Luxury Cloud Winter Blanket", "warm lightweight breathable microfiber double blanket"],
      ["Golden Flora Reversible Wedding Mink Blanket", "rich jewel-toned reversible double quilt blanket"],
    ],
  ],
  [
    "furniture",
    "pillow",
    "pillow",
    "Pillow",
    990,
    [
      ["Orthopedic Contour Memory Foam Sleeping Pillow", "ergonomic neck support with washable bamboo fabric cover"],
      ["Ultra-Soft Microfiber Hotel Comfort Pillow Pair", "resilient bounce-back hollow microfiber filling"],
      ["BreatheEasy Pure Cotton Bedding Pillows (Set of 2)", "natural breathable cotton staple for cool slumber"],
    ],
  ],
  [
    "furniture",
    "bedsheet",
    "bedsheet",
    "Bedsheet",
    1490,
    [
      ["Pure Glace Cotton King Size Double Bedsheet", "210 TC colorfast floral print with two matching pillowcases"],
      ["Traditional Sanganeri Handblock Cotton Bedspread", "authentic Jaipur artisan craft on pre-shrunk cotton"],
      ["Satin Stripe Luxury 400 TC Double Bedsheet", "hotel suite sheen with ultra-smooth combed cotton weave"],
    ],
  ],
  [
    "furniture",
    "pillow-cover",
    "pillow-cover",
    "Pillow Cover",
    490,
    [
      ["Pure Cotton Zippered Pillow Covers (Pack of 4)", "durable concealed zipper with shrink-resistant weave"],
      ["Velvet Quilted Decorative Pillow Cover Pair", "geometric quilted pattern for luxury couch & bed styling"],
      ["Floral Satin Smooth Flanged Pillow Shams", "decorative border flange with elegant silk-touch finish"],
    ],
  ],
  [
    "furniture",
    "parda",
    "parda",
    "Parda",
    1990,
    [
      ["Jacquard Silk Room Darkening Parda (Set of 2 - 7ft)", "blackout thermal insulation with rust-proof metal eyelets"],
      ["Embossed Velvet Eyelet Living Room Parda (9ft)", "luxurious heavy fall drape for grand door heights"],
      ["Sheer Embroidered Net Decorative Curtains", "soft filtered daylight with graceful scallop borders"],
    ],
  ],
  [
    "furniture",
    "namaz-chauki",
    "namaz-chauki",
    "Namaz Chauki",
    2490,
    [
      ["Solid Teak Namaz Chauki with Velvet Top", "handcrafted low wooden seat with padded emerald cushion"],
      ["Brass Inlaid Sheesham Wood Prayer Chauki", "traditional pious motifs hand-cut by Saharanpur artisans"],
      ["Foldable Portable Wooden Namaz Low Stool", "compact folding mechanism for easy storage and travel"],
    ],
  ],
  [
    "furniture",
    "plastic-table",
    "plastic-table",
    "Plastic Table",
    1890,
    [
      ["Supreme Heavy-Duty Plastic Center Table", "weatherproof virgin polymer with lower storage rack"],
      ["Nilkamal 4-Seater Dining Plastic Table", "high-gloss scratch-resistant top for family meals"],
      ["Multipurpose Foldable Balcony Plastic Table", "lightweight rust-proof table for study, work & outdoors"],
    ],
  ],
  [
    "furniture",
    "plastic-chairs",
    "plastic-chairs",
    "Plastic Chairs",
    3490,
    [
      ["Nilkamal Premium High-Back Arm Chairs (Set of 4)", "heavy weight-bearing capacity with lumbar back support"],
      ["Supreme Cushion-Back Heavy Virgin Plastic Chairs", "modern matte finish suitable for dining and living"],
      ["Rattan Weave Royal Pattern Plastic Chairs (Pair)", "elegant wicker texture look with heavy-duty durability"],
    ],
  ],
  [
    "furniture",
    "baxa",
    "baxa",
    "Baxa",
    4990,
    [
      ["Heavy Galvanized Steel 5-Feet Storage Baksa", "waterproof soldered seams with heavy padlock hasps"],
      ["Bridal Painted Iron Trunk (Baksa) with Handles", "traditional wedding storage trunk with dual carry handles"],
      ["Industrial Gauge Reinforced Steel Storage Box", "reinforced ribbed corners for generational grain & bedding storage"],
    ],
  ],
  [
    "furniture",
    "peti",
    "peti",
    "Peti",
    3990,
    [
      ["Traditional Sheet Metal Storage Peti (32-Inch)", "heavy-duty lid hinges with secure locking bracket"],
      ["Shahi Dowry Storage Peti with Brass Corners", "hand-painted auspicious motifs with corner brackets"],
      ["Compact Weather-Resistant Iron Household Peti", "damp-proof elevated base for linen and precious textiles"],
    ],
  ],
  [
    "furniture",
    "trolley-bag",
    "trolley-bag",
    "Trolley Bag",
    5990,
    [
      ["Safari 360-Degree Spinner 3-Piece Trolley Set", "unbreakable polycarbonate shell with TSA combination lock"],
      ["VIP Skybag Hard-Shell 65cm Expandable Trolley", "silent multi-directional wheels with telescoping handle"],
      ["American Tourister Soft-Side Luggage Trolley Bag", "water-repellent polyester with expander and front pockets"],
    ],
  ],

  // ===================== HOME APPLIANCES (User Specified 10 Categories) =====================
  [
    "appliance",
    "washing-machine",
    "washing-machine",
    "Washing Machine",
    21990,
    [
      ["Veda 8kg Fully Automatic Front Load Inverter Washer", "steam allergy care and ultra-fast 15-minute quick cycle"],
      ["Aarohan 7.5kg Smart Top Load Washing Machine", "smart water-fall pulsator with stainless steel diamond drum"],
      ["Prana 8.5kg Semi-Automatic Twin Tub Washer", "high-speed turbo dry with lint collector filter"],
    ],
  ],
  [
    "appliance",
    "fridge",
    "fridge",
    "Fridge",
    27990,
    [
      ["Veda 265L Double Door Frost-Free Refrigerator", "convertible cooling modes with intelligent inverter compressor"],
      ["Prana 190L Direct Cool 5-Star Single Door Fridge", "super-fast ice making with toughened glass shelves"],
      ["Aarohan 340L Convertible 5-in-1 Triple Door Fridge", "separate moisture-fresh active zone for crisp fruits & vegetables"],
    ],
  ],
  [
    "appliance",
    "cooler",
    "cooler",
    "Cooler",
    8990,
    [
      ["Symphony 70L Heavy High-Blower Desert Air Cooler", "dense honeycomb cooling pads with powerful 45-foot air throw"],
      ["Orient Tornado 85L Metal Blade Desert Cooler", "heavy copper motor with large ice chamber for harsh summers"],
      ["Havells Frost King 65L Auto-Fill Desert Cooler", "inverter compatible with 4-way motorized air deflection"],
    ],
  ],
  [
    "appliance",
    "diacut-cooler",
    "diacut-cooler",
    "Diacut Cooler",
    10990,
    [
      ["Riddhy Heavy Galvanized Diacut Iron Body Cooler", "authentic commercial diacut metal body with submersible pump"],
      ["Prayagraj Special 90L Diacut High-Velocity Cooler", "heavy gauge galvanized steel resistant to rust and leaks"],
      ["Kisan Gold Diacut Commercial Body Air Cooler", "high-RPM exhaust fan with 3-side wood wool pads"],
    ],
  ],
  [
    "appliance",
    "mixer",
    "mixer",
    "Mixer",
    3490,
    [
      ["Sujata Type 900W Heavy Duty Mixer Grinder", "3 heavy-gauge stainless steel jars with flow breaker design"],
      ["Bajaj Classic 750W 4-Jar Kitchen Mixer Grinder", "overload protector with multi-function stainless steel blades"],
      ["Philips PowerPro 1000W Turbo Speed Mixer Grinder", "hands-free jar locking with active ventilation motor cooling"],
    ],
  ],
  [
    "appliance",
    "juicer",
    "juicer",
    "Juicer",
    4990,
    [
      ["NutriBlend Cold Press Slow Masticating Juicer", "retains 100% vitamins with whisper-quiet reverse rotation"],
      ["Centrifugal High-Yield Whole Fruit Juice Extractor", "extra-large 75mm feeding chute with micro-mesh steel filter"],
      ["Maharaja All-in-One Juicer Mixer with Pulp Ejector", "separate detachable pulp collector with citrus press cone"],
    ],
  ],
  [
    "appliance",
    "iron",
    "iron",
    "Iron (Press)",
    1290,
    [
      ["Philips Heavy Weight 1000W Dry Iron (Dhobi Press)", "authentic heavy golden soleplate with uniform fabric glide"],
      ["Bajaj Majesty Non-Stick Golden Soleplate Dry Iron", "360-degree swivel cord with adjustable thermostat dial"],
      ["Usha Instant Steam Boost 1600W Press Iron", "vertical steam shot with anti-calc self-cleaning function"],
    ],
  ],
  [
    "appliance",
    "gas-chulha",
    "gas-chulha",
    "Gas Chulha",
    3990,
    [
      ["Prestige 3-Burner Toughened Black Glass Gas Stove", "high thermal efficiency tri-pin brass burners with spill trays"],
      ["Sunflame Heavy Stainless Steel 2-Burner Gas Chulha", "rust-proof seamless steel body with heavy pan supports"],
      ["Surya 4-Burner Auto-Ignition Brass Gas Cooktop", "multi-spark auto ignition with shatterproof toughened glass"],
    ],
  ],
  [
    "appliance",
    "utensils-washer",
    "utensils-washer",
    "Utensils Washer",
    34990,
    [
      ["Voltas Beko 14-Place Intensive Kadhai Dishwasher", "specialized 70°C hot water cycle engineered for oily Indian utensils"],
      ["Bosch Serie 6 Free-Standing Hygiene Utensil Washer", "EcoSilence drive with dosage assist and customized cutlery drawer"],
      ["IFB Neptune Smart Silver 12-Place Settings Dishwasher", "water softening device with rapid 30-minute express wash"],
    ],
  ],
  [
    "appliance",
    "roti-maker",
    "roti-maker",
    "Roti Maker",
    2290,
    [
      ["Bajaj Vacco 1000W Automatic Non-Stick Roti Maker", "shockproof stainless steel housing with temperature indicator light"],
      ["Prestige Quick-Puff Automatic Chapati & Roti Press", "food-grade double non-stick coated plates for puff rotis"],
      ["Eagle Heavy Stainless Steel Dual Heating Roti Maker", "dual thermostat control with durable heat-resistant grip handle"],
    ],
  ],

  // ===================== UTENSILS (User Specified Utensils Category) =====================
  [
    "utensils",
    "dinner-set",
    "dinner-set",
    "Dinner Set",
    5990,
    [
      ["Riddhy Royal 61-Piece Stainless Steel Heavy Dinner Set", "full wedding suite: 6 full plates, 6 quarter plates, 12 katoris, spoons, bowls, jugs"],
      ["Cello Opalware Floral 35-Piece Microwave Safe Dinner Set", "chip-resistant bone-ash-free pristine white opal dinnerware"],
      ["Kuber Gold Laser-Etched 51-Piece Special Dinner Suite", "laser-carved royal borders on heavy gauge food-grade steel"],
    ],
  ],
  [
    "utensils",
    "pressure-cooker",
    "pressure-cooker",
    "Pressure Cooker",
    2990,
    [
      ["Hawkins Contura Hard Anodized 5L & 3L Pressure Cooker Combo", "inner-lid safety design with thick induction base"],
      ["Prestige Svachh Clip-On Induction 5L Deep Cooker", "spill-control glass lid with universal clip-on locking mechanism"],
      ["Pigeon Inox Tri-Ply Stainless Steel Outer Lid 3L Cooker", "tri-ply thermal bottom for scorch-free dal and rice cooking"],
    ],
  ],
  [
    "utensils",
    "kadai-frypan",
    "kadai-frypan",
    "Kadai & Fry Pan",
    2490,
    [
      ["Bergner Tri-Ply 2.5L Heavy Stainless Steel Kadai with Glass Lid", "clad stainless steel with cast riveted cool handles"],
      ["Prestige Granite Non-Stick Deep Kadai & Frypan Duo", "5-layer scratch resistant non-stick surface with wooden spatula"],
      ["Traditional Heavy Cast Iron Kadai with Brass Handles", "pre-seasoned for authentic deep frying and rich natural iron enrichment"],
    ],
  ],
  [
    "utensils",
    "roti-tawa",
    "roti-tawa",
    "Roti Tawa",
    1190,
    [
      ["Hawkins Futura 28cm Hard Anodized Concave Roti Tawa", "4.88mm ultra-thick body for evenly puffed golden rotis and phulkas"],
      ["Milton Heavy Iron Handcrafted Flat Roti Tawa", "hand-beaten traditional iron tawa with riveted wooden handle"],
      ["Prestige Omega Die-Cast Non-Stick Multi-Purpose Tawa", "granite coat suitable for paper-thin dosas, rotis and parathas"],
    ],
  ],
  [
    "utensils",
    "thali-set",
    "thali-set",
    "Thali Set",
    1890,
    [
      ["Mirror Finish Heavy SS 304 Maharaja Thali Set", "includes 6 deep thalis, 12 curio katoris, 6 glasses and 6 dessert spoons"],
      ["Traditional Silver-Look Embossed Royal Thali Set", "hand-embossed heritage floral rim for festive Indian feasts"],
      ["Everyday Family Stainless Steel Beaded Edge Thali 6-Pack", "dishwasher safe, rust-proof mirror polished dining plates"],
    ],
  ],
  [
    "utensils",
    "water-jug",
    "water-jug",
    "Water Jug & Glasses",
    1490,
    [
      ["Shri & Sam Heavy Stainless Steel 2L Water Jug with 6 Glasses", "drip-free spout with easy pour ergonomic tubular handle"],
      ["Pure Hand-Hammered Ayurvedic Copper Water Jug & Tumblers", "100% pure copper for overnight health-giving tamra jal"],
      ["Floral Embossed Royal Steel Water Jug & Tumbler 7-Piece Set", "embossed festive dining jug and glass presentation set"],
    ],
  ],
  [
    "utensils",
    "masala-dabba",
    "masala-dabba",
    "Masala Dabba",
    890,
    [
      ["Stainless Steel 7-Compartment Spice Dabba with Acrylic Lid", "see-through shatterproof lid with 7 cups and stainless spice spoon"],
      ["Traditional Pure Brass 7-Container Kitchen Masala Box", "solid brass with engraved floral cover for aromatic spice longevity"],
      ["Airtight Heavy Gauge Steel Spice Storage Box", "tight silicone sealed container keeping haldi, jeera, mirchi fresh"],
    ],
  ],
  [
    "utensils",
    "casserole-set",
    "casserole-set",
    "Casserole Set",
    1990,
    [
      ["Milton Galaxia Insulated SS Casserole Set of 3 (1L, 1.5L, 2.5L)", "double-wall polyurethane thermal insulation keeping rotis warm 6 hours"],
      ["Cello Chef Deluxe Thermal Hotpot Food Warmer Gift Set", "integrated locking lid with mirror finish inner stainless liner"],
      ["Jaypee Plus Metallic Finish 3-Piece Hotpot Roti Casserole", "stylish table presentation with twist-lock heat seal technology"],
    ],
  ],
  [
    "utensils",
    "bhagona-set",
    "bhagona-set",
    "Bhagona Set",
    2290,
    [
      ["Stainless Steel Deep Tope / Bhagona 5-Piece Nesting Set", "complete range with flat steel lids for milk, curries and boiling"],
      ["Copper Bottom Heavy Milk & Rice Boiling Bhagona 3-Set", "encapsulated copper bottom preventing milk scorching on flame"],
      ["Tri-Ply Induction Base Encapsulated Saucepan & Bhagona Duo", "energy-efficient 3-layer alloy with internal volume measurement marks"],
    ],
  ],
  [
    "utensils",
    "cutlery-set",
    "cutlery-set",
    "Cutlery Set",
    990,
    [
      ["24-Piece Stainless Steel Cutlery Set with Revolving Stand", "6 dinner spoons, 6 dessert spoons, 6 forks and 6 baby spoons with stand"],
      ["Golden Handle Luxury Mirror Finish Dessert & Dining Spoon Set", "dual-tone electroplated luxury cutlery set in gift velvet case"],
      ["Heavy Duty Stainless Steel Table Spoons & Forks (Set of 12)", "corrosion-resistant high carbon stainless steel for everyday dining"],
    ],
  ],
  [
    "utensils",
    "water-dispenser",
    "water-dispenser",
    "Water Dispenser Drum",
    2790,
    [
      ["Mayur Stainless Steel 15L Insulated Water Cooler Tank", "heavy duty insulated beverage drum with food-grade plastic brass tap"],
      ["Milton Kool Stallion 20L Heavy Duty Thermal Water Drum", "wide mouth for ice cubes with leak-proof push tap and sturdy handles"],
      ["Stainless Steel 10L Mirror Finish Dispenser Jug with Brass Spigot", "tabletop purified water dispenser for kitchens and festive gatherings"],
    ],
  ],
  [
    "utensils",
    "tea-milk-pot",
    "tea-milk-pot",
    "Tea & Milk Pot",
    1290,
    [
      ["Heavy Gauge Stainless Steel Chai Saucepan with Cool Handle", "dual pour spouts with heat-insulating phenolic handle for daily chai"],
      ["Stainless Steel Whistling Milk Boiler Pot with Funnel (2L)", "double-wall steam whistle prevents milk from boiling over on stove"],
      ["Induction Base Tri-Ply Tea Saucepan with Tempered Glass Lid", "even heat distribution with glass lid and steam release vent"],
    ],
  ],
];

const dimensions = {
  // Furniture
  "double-bed": [160, 210, 105],
  sringardan: [80, 45, 180],
  "sofa-set": [220, 90, 85],
  "centre-table": [105, 60, 45],
  "wooden-wordrobe": [180, 58, 210],
  almirah: [95, 50, 198],
  "fancy-almirah": [105, 52, 205],
  mattress: [183, 198, 20],
  rajai: [220, 240, 6],
  blanket: [210, 230, 4],
  pillow: [45, 70, 15],
  bedsheet: [240, 270, 1],
  "pillow-cover": [48, 72, 1],
  parda: [120, 215, 2],
  "namaz-chauki": [45, 45, 20],
  "plastic-table": [115, 75, 75],
  "plastic-chairs": [55, 52, 85],
  baxa: [150, 75, 60],
  peti: [80, 50, 45],
  "trolley-bag": [45, 28, 68],

  // Appliances
  "washing-machine": [60, 62, 85],
  fridge: [60, 68, 172],
  cooler: [65, 55, 115],
  "diacut-cooler": [75, 60, 125],
  mixer: [35, 22, 38],
  juicer: [30, 24, 42],
  iron: [26, 12, 14],
  "gas-chulha": [72, 40, 14],
  "utensils-washer": [60, 60, 85],
  "roti-maker": [32, 28, 15],

  // Utensils
  "dinner-set": [45, 35, 28],
  "pressure-cooker": [38, 24, 22],
  "kadai-frypan": [34, 28, 14],
  "roti-tawa": [42, 28, 6],
  "thali-set": [34, 34, 18],
  "water-jug": [22, 16, 26],
  "masala-dabba": [22, 22, 9],
  "casserole-set": [32, 28, 22],
  "bhagona-set": [30, 30, 22],
  "cutlery-set": [18, 18, 26],
  "water-dispenser": [32, 32, 48],
  "tea-milk-pot": [32, 18, 15],

  // Legacy mappings
  sofa: [210, 88, 82],
  bed: [160, 210, 105],
  wardrobe: [180, 58, 210],
  dining: [140, 85, 76],
  study: [120, 60, 75],
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
  "double-bed": "double-bed",
  sringardan: "sringardan",
  "sofa-set": "sofa-set",
  "centre-table": "centre-table",
  "wooden-wordrobe": "wooden-wordrobe",
  almirah: "almirah",
  "fancy-almirah": "fancy-almirah",
  mattress: "mattress",
  rajai: "rajai",
  blanket: "blanket",
  pillow: "pillow",
  bedsheet: "bedsheet",
  "pillow-cover": "pillow-cover",
  parda: "parda",
  "namaz-chauki": "namaz-chauki",
  "plastic-table": "plastic-table",
  "plastic-chairs": "plastic-chairs",
  baxa: "baxa",
  peti: "peti",
  "trolley-bag": "trolley-bag",
  "washing-machine": "washing-machine",
  fridge: "fridge",
  cooler: "cooler",
  "diacut-cooler": "diacut-cooler",
  mixer: "mixer",
  juicer: "juicer",
  iron: "iron",
  "gas-chulha": "gas-chulha",
  "utensils-washer": "utensils-washer",
  "roti-maker": "roti-maker",
  "dinner-set": "dinner-set",
  "pressure-cooker": "pressure-cooker",
  "kadai-frypan": "kadai-frypan",
  "roti-tawa": "roti-tawa",
  "thali-set": "thali-set",
  "water-jug": "water-jug",
  "masala-dabba": "masala-dabba",
  "casserole-set": "casserole-set",
  "bhagona-set": "bhagona-set",
  "cutlery-set": "cutlery-set",
  "water-dispenser": "water-dispenser",
  "tea-milk-pot": "tea-milk-pot",
  sofa: "sofa",
  bed: "bed",
  wardrobe: "wardrobe",
  dining: "dining",
  study: "study",
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

const specificProductImage = {
  "mira-3-seater-sofa": "/images/furniture/sofas/product-sofa-mira.webp",
  "aarav-l-shape-sectional": "/images/furniture/sofas/product-sofa-aarav.webp",
  "nila-loveseat": "/images/furniture/sofas/product-sofa-nila.webp",
  "avani-queen-storage-bed": "/images/furniture/beds/product-bed-avani.webp",
  "kesar-platform-bed": "/images/furniture/beds/product-bed-kesar.webp",
  "mitti-daybed": "/images/furniture/beds/product-bed-mitti.webp",
  "saanvi-3-door-wardrobe": "/images/furniture/storage/product-wardrobe-saanvi.webp",
  "nivaan-sliding-wardrobe": "/images/furniture/storage/product-wardrobe-nivaan.webp",
  "arohi-2-door-wardrobe": "/images/furniture/storage/product-wardrobe-arohi.webp",
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
        const [w, d, h] = dimensions[modelType] || [60, 60, 60];
        const appliance = type === "appliance";
        const isUtensils = type === "utensils";
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const categoryInfo =
          CATEGORY_SEED.find((entry) => entry.slug === category) || {
            name: _label,
            room: isUtensils ? "kitchen" : appliance ? "kitchen" : "living",
          };

        const fallbackImg =
          IMG.products[imageFor[modelType]] ||
          IMG.categories[category] ||
          "/images/product-sofa.webp";

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
          image:
            specificProductImage[slug] ||
            productGalleriesMap[slug]?.[0]?.url ||
            fallbackImg,
          imageAlt: `${name} — authentic RF Riddhy retail collection`,
          isDemoImage: false,
          gallery: productGalleriesMap[slug] || [
            {
              url: fallbackImg,
              thumbUrl: fallbackImg,
              alt: `${name} — Verified Product Front View`,
              view: "front",
              viewType: "verified-product",
              sortOrder: 0,
            },
          ],
          dimensions: { width: w, depth: d, height: h, unit: "cm" },
          packageDimensions: {
            width: w + 8,
            depth: d + 8,
            height: h + 10,
            unit: "cm",
          },
          warranty: appliance
            ? {
                manufacturer: "1 year comprehensive",
                compressor:
                  modelType.includes("fridge") || modelType.includes("cooler")
                    ? "5-10 years warranty on motor / compressor"
                    : null,
                seller: "30-day doorstep installation support",
              }
            : isUtensils
              ? {
                  manufacturer: "2 years replacement warranty",
                  seller: "10-day safe transit and replacement support",
                }
              : {
                  manufacturer: null,
                  seller: "2 years structural warranty on frame and hinges",
                },
          gstRate: isUtensils ? 12 : 18,
          specs: appliance
            ? {
                capacity: modelType.includes("fridge")
                  ? "265 L"
                  : modelType.includes("washing")
                    ? "8 kg"
                    : modelType.includes("cooler")
                      ? "70 L"
                      : "Standard Household",
                energyRating: "5 Star",
                noise: "Low-noise operation",
                finish: "Satin chrome / premium enamel",
              }
            : isUtensils
              ? {
                  material: "Food Grade SS 304 Stainless Steel / Tri-Ply",
                  finish: "Mirror Polish Finish",
                  inductionCompatible: "Yes",
                  dishwasherSafe: "Yes",
                }
              : {
                  material: "Solid Teak / Sheesham & Heavy Gauge Steel",
                  colour: ["Natural Teak", "Warm Walnut", "Royal Ivory"][index % 3],
                  assembly: "Free doorstep white-glove assembly available",
                },
          features: [
            tagline,
            appliance || isUtensils
              ? "Safe doorstep delivery with transit guarantee"
              : "Handcrafted for everyday Indian households and marriage packages",
            "Authentic RF Riddhy quality verified",
          ],
          metaTitle: `${name} | RF Riddhy`,
          metaDescription: `${tagline}. Explore authentic specs, dimensions and pricing at RF Riddhy Mansurabad.`,
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
