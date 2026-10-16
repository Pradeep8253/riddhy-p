import mongoose from 'mongoose';
const { Schema } = mongoose;
const UserSchema = new Schema({ name: { type: String, required: true }, email: { type: String, lowercase: true, unique: true, sparse: true }, phone: { type: String, unique: true, sparse: true }, passwordHash: String, role: { type: String, enum: ['customer','admin','super-admin','support','warehouse','marketing','finance'], default: 'customer' }, addresses: [Schema.Types.ObjectId], preferences: Schema.Types.Mixed, active: { type: Boolean, default: true } }, { timestamps: true });
const AdminUserSchema = new Schema({ name: String, email: { type: String, unique: true, lowercase: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ['admin','super-admin','support','warehouse','marketing','finance'], default: 'admin' }, active: { type: Boolean, default: true }, lastLoginAt: Date }, { timestamps: true });
const RoleSchema = new Schema({ name: { type: String, unique: true }, permissions: [String], system: { type: Boolean, default: false } }, { timestamps: true });
const BannerSchema = new Schema({
  name: String,
  title: String,
  subtitle: String,
  description: String,
  zone: { type: String, default: 'home-hero' },
  desktopImage: String,
  mobileImage: String,
  href: { type: String, default: '/offers' },
  ctaText: { type: String, default: 'Explore Offers' },
  campaignTag: String,
  startsAt: Date,
  endsAt: Date,
  active: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  targeting: Schema.Types.Mixed,
  analytics: Schema.Types.Mixed,
  alt: String
}, { timestamps: true });
BannerSchema.index({ zone: 1, active: 1, sortOrder: 1, startsAt: 1, endsAt: 1 });
const CmsPageSchema = new Schema({ slug: { type: String, unique: true }, title: String, body: String, status: { type: String, enum: ['draft','published'], default: 'draft' }, publishedAt: Date, seo: Schema.Types.Mixed }, { timestamps: true });
const MediaAssetSchema = new Schema({ url: String, publicId: String, storage: { type: String, enum: ['cloudinary','local'], default: 'local' }, mime: String, bytes: Number, alt: String, isDemoImage: { type: Boolean, default: false }, uploadedBy: Schema.Types.ObjectId }, { timestamps: true });
const ReviewSchema = new Schema({ productId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId, orderId: Schema.Types.ObjectId, rating: { type: Number, min: 1, max: 5 }, title: String, body: String, media: [String], verifiedPurchase: { type: Boolean, default: false }, status: { type: String, enum: ['pending','published','rejected'], default: 'pending' } }, { timestamps: true });
const WishlistSchema = new Schema({ userId: Schema.Types.ObjectId, items: [Schema.Types.ObjectId] }, { timestamps: true });
WishlistSchema.index({ userId: 1 }, { unique: true });
const AuditLogSchema = new Schema({ actorId: Schema.Types.ObjectId, actorEmail: String, action: String, entity: String, entityId: String, before: Schema.Types.Mixed, after: Schema.Types.Mixed, ip: String }, { timestamps: true });

const SiteSettingSchema = new Schema({
  key: { type: String, unique: true, default: 'site_config' },
  contact: {
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    responseTime: { type: String, default: '' },
    hours: { type: String, default: '' },
    holidaysNotice: { type: String, default: '' }
  },
  showroom: {
    name: { type: String, default: 'RF Riddhy Experience Store' },
    addressLine1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    mapUrl: { type: String, default: '' },
    hours: { type: String, default: '' }
  },
  consultation: {
    capacityPerSlot: { type: Number, default: 3 },
    homeVisit: { type: Boolean, default: false }
  },
  story: {
    foundedYear: { type: String, default: '' },
    originCity: { type: String, default: '' },
    founderNarrative: { type: String, default: '' },
    metrics: {
      homesFurnished: { type: String, default: '' },
      pincodesServed: { type: String, default: '' },
      satisfactionRate: { type: String, default: '' }
    },
    partnerBrands: [{ type: String }]
  },
  updatedBy: Schema.Types.ObjectId,
  updatedByEmail: String
}, { timestamps: true });

const AuthOtpSchema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['password_reset', 'verification'], default: 'password_reset' },
  userType: { type: String, enum: ['user', 'admin'], default: 'user' },
  expiresAt: { type: Date, required: true, expires: 600 }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
export const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
export const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', CmsPageSchema);
export const MediaAsset = mongoose.models.MediaAsset || mongoose.model('MediaAsset', MediaAssetSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const SiteSetting = mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);
export const AuthOtp = mongoose.models.AuthOtp || mongoose.model('AuthOtp', AuthOtpSchema);

