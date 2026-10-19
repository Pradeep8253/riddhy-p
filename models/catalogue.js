import mongoose from 'mongoose';
const { Schema } = mongoose;

const CategorySchema = new Schema({ name: { type: String, required: true }, name_hi: String, slug: { type: String, unique: true, required: true }, type: { type: String, enum: ['furniture','appliance'], required: true }, parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null }, room: String, image: String, sortOrder: { type: Number, default: 0 }, filters: { type: [Schema.Types.Mixed], default: [] }, active: { type: Boolean, default: true } }, { timestamps: true });
CategorySchema.index({ parentId: 1, sortOrder: 1 });
const BrandSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, unique: true }, logo: String, description: String, active: { type: Boolean, default: true } }, { timestamps: true });
const ProductSchema = new Schema({
  name: { type: String, required: true },
  name_hi: String,
  slug: { type: String, unique: true, required: true },
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
  brand: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  category: { type: String, required: true },
  categoryLabel: String,
  room: String,
  type: { type: String, enum: ['furniture','appliance'], required: true },
  modelType: String,
  description: String,
  description_hi: String,
  tagline: String,
  tagline_hi: String,
  media: { type: [Schema.Types.Mixed], default: [] },
  image: String,
  imageAlt: String,
  gallery: [{
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
    url: { type: String, required: true },
    thumbUrl: String,
    blurDataURL: String,
    alt: String,
    sortOrder: { type: Number, default: 0 }
  }],
  tags: {
    type: [String],
    default: [],
    enum: ['best-selling', 'popular', 'trending', 'new-arrival', 'featured', 'deal', 'limited']
  },
  tagOverrides: {
    pin: { type: [String], default: [] },
    hide: { type: [String], default: [] }
  },
  sales30d: { type: Number, default: 0, min: 0 },
  views30d: { type: Number, default: 0, min: 0 },
  wishlistCount: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  salesTotal: { type: Number, default: 0, min: 0 },
  badgeText: String,
  hsnCode: { type: String, default: '9403' },
  specs: { type: Schema.Types.Mixed, default: {} },
  dimensions: Schema.Types.Mixed,
  packageDimensions: Schema.Types.Mixed,
  warranty: Schema.Types.Mixed,
  gstRate: { type: Number, default: 18 },
  price: { type: Number, min: 0 },
  mrp: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['draft','active','archived'], default: 'draft' },
  archivedAt: Date,
  isDemo: { type: Boolean, default: true },
  isDemoImage: { type: Boolean, default: true },
  features: [String],
  seo: Schema.Types.Mixed,
  model3d: Schema.Types.Mixed
}, { timestamps: true });
ProductSchema.index({ type: 1, category: 1, status: 1, price: 1 });
ProductSchema.index({ brand: 1, category: 1, price: 1 });
ProductSchema.index({ status: 1, tags: 1 });
ProductSchema.index({ status: 1, sales30d: -1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', slug: 'text', brand: 'text', category: 'text', categoryLabel: 'text', tags: 'text' });
const VariantSchema = new Schema({ productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, sku: { type: String, unique: true, required: true }, barcode: String, hsnCode: String, gstRate: Number, attributes: { type: Map, of: String, default: {} }, price: { type: Number, min: 0, required: true }, mrp: { type: Number, min: 0 }, stock: { type: Number, min: 0, default: 0 }, active: { type: Boolean, default: true }, model3d: Schema.Types.Mixed }, { timestamps: true });
VariantSchema.index({ productId: 1, active: 1 });
const PriceSchema = new Schema({ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, variantId: { type: Schema.Types.ObjectId, ref: 'Variant' }, currency: { type: String, default: 'INR' }, mrp: Number, sellingPrice: Number, validFrom: Date, validTo: Date, active: { type: Boolean, default: true } }, { timestamps: true });
const PromotionSchema = new Schema({ name: String, code: String, kind: { type: String, enum: ['percentage','fixed','bundle','bank'] }, value: Number, startsAt: Date, endsAt: Date, active: { type: Boolean, default: false }, rules: Schema.Types.Mixed }, { timestamps: true });
const CouponSchema = new Schema({ code: { type: String, unique: true, uppercase: true }, kind: { type: String, enum: ['percentage','fixed'] }, value: Number, minCartValue: { type: Number, default: 0 }, maxDiscount: Number, startsAt: Date, endsAt: Date, usageLimit: Number, usageCount: { type: Number, default: 0 }, active: { type: Boolean, default: true }, rules: Schema.Types.Mixed }, { timestamps: true });

const MarriagePackageSchema = new Schema({
  name: { type: String, required: true },
  name_hi: String,
  slug: { type: String, unique: true, required: true },
  tier: { type: String, enum: ['basic', 'premium', 'luxury'], default: 'basic' },
  tagline: String,
  tagline_hi: String,
  description: { type: String, required: true },
  description_hi: String,
  bannerImage: String,
  thumbnailImage: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  savings: Number,
  categories: [String],
  items: [{
    category: String,
    title: String,
    quantity: { type: Number, default: 1 },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    specs: String,
    image: String,
    isOptional: { type: Boolean, default: false }
  }],
  customizableAddons: [{
    title: String,
    category: String,
    price: Number,
    description: String,
    image: String,
    includedByDefault: { type: Boolean, default: false }
  }],
  highlightBadge: String,
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

MarriagePackageSchema.index({ active: 1, sortOrder: 1 });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Variant = mongoose.models.Variant || mongoose.model('Variant', VariantSchema);
export const Price = mongoose.models.Price || mongoose.model('Price', PriceSchema);
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);
export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const MarriagePackage = mongoose.models.MarriagePackage || mongoose.model('MarriagePackage', MarriagePackageSchema);

