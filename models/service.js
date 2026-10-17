import mongoose from 'mongoose';
const { Schema } = mongoose;
const AddressSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, label: String, name: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String, landmark: String, isDefault: { type: Boolean, default: false } }, { timestamps: true });
const ShipmentSchema = new Schema({ orderId: Schema.Types.ObjectId, carrier: String, trackingNumber: String, status: String, trackingUrl: String, events: [{ status: String, at: Date, location: String, note: String }] }, { timestamps: true });
const InstallationSchema = new Schema({ orderId: Schema.Types.ObjectId, itemSku: String, pincode: String, slotAt: Date, technician: String, status: { type: String, enum: ['requested','booked','in_progress','completed','cancelled'], default: 'requested' }, notes: String }, { timestamps: true });
const WarrantyPolicySchema = new Schema({ name: String, source: { type: String, enum: ['manufacturer','seller','extended'] }, durationDays: Number, extensionPriceInr: Number, startsOn: { type: String, enum: ['delivery','installation'], default: 'delivery' }, coverage: String, active: { type: Boolean, default: true }, policyVersion: String }, { timestamps: true });
const ProductRegistrationSchema = new Schema({
  userId: Schema.Types.ObjectId,
  orderId: Schema.Types.ObjectId,
  orderNumber: String,
  productId: Schema.Types.ObjectId,
  productName: String,
  variantId: Schema.Types.ObjectId,
  sku: String,
  unitIndex: { type: Number, default: 0 },
  serialNumber: String,
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  purchaseDate: Date,
  activationDate: Date,
  expiryDate: Date,
  durationDays: { type: Number, default: 365 },
  proofOfPurchase: String,
  source: { type: String, enum: ['manufacturer','seller','extended'], default: 'seller' },
  policyVersion: String,
  registeredFrom: { type: String, enum: ['order','offline','admin','website'], default: 'website' },
  status: { type: String, enum: ['active', 'expiring_soon', 'expired', 'rejected'], default: 'active' },
  verified: { type: Boolean, default: true },
  adminNotes: String
}, { timestamps: true });
const WarrantyExtensionSchema = new Schema({ userId: Schema.Types.ObjectId, registrationId: Schema.Types.ObjectId, years: Number, quotedAmount: Number, currency: { type: String, default: 'INR' }, status: { type: String, enum: ['requested','quoted','paid','active','declined'], default: 'requested' }, policyVersion: String, notes: String }, { timestamps: true });
WarrantyExtensionSchema.index({ registrationId: 1, userId: 1, status: 1 });
ProductRegistrationSchema.index({ userId: 1, expiryDate: 1 });
ProductRegistrationSchema.index({ serialNumber: 1 }, { sparse: true, unique: true });
ProductRegistrationSchema.index({ customerPhone: 1, orderNumber: 1 });
ProductRegistrationSchema.index({ orderId: 1, sku: 1, unitIndex: 1 }, { unique: true, sparse: true });
ProductRegistrationSchema.index({ status: 1, expiryDate: 1 });
ProductRegistrationSchema.index({ verified: 1, createdAt: -1 });

const ClaimSchema = new Schema({
  claimNumber: { type: String, unique: true, sparse: true },
  userId: Schema.Types.ObjectId,
  registrationId: Schema.Types.ObjectId,
  orderId: Schema.Types.ObjectId,
  issue: String,
  media: [String],
  status: { type: String, enum: ['submitted','under_review','approved','rejected','resolved'], default: 'submitted' },
  preferredContact: String,
  assignedTo: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  assignedToEmail: String,
  slaDeadline: Date,
  resolvedAt: Date,
  resolutionNotes: String
}, { timestamps: true });
ClaimSchema.index({ status: 1, createdAt: -1 });
const ClaimEventSchema = new Schema({ claimId: Schema.Types.ObjectId, status: String, note: String, actorId: Schema.Types.ObjectId }, { timestamps: true });
const ReturnRequestSchema = new Schema({ userId: Schema.Types.ObjectId, orderId: Schema.Types.ObjectId, orderNumber: String, reason: { type: String, required: true }, itemSkus: [String], status: { type: String, enum: ['requested','under_review','approved','rejected','picked_up','refunded'], default: 'requested' }, notes: String }, { timestamps: true });
const LeadSchema = new Schema({
  kind: { type: String, enum: ['contact', 'trade', 'consultation', 'bulk', 'on_demand', 'general'], required: true },
  reference: String,
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  company: String,
  pincode: String,
  quantity: Number,
  topic: String,
  subject: String,
  orderNumber: String,
  message: String,
  status: {
    type: String,
    enum: ['new', 'in_progress', 'scheduled', 'completed', 'no_show', 'resolved', 'spam'],
    default: 'new'
  },
  // On-demand & bulk inquiry fields
  productName: String,
  category: String,
  specifications: String,
  deliveryLocation: String,
  preferredContactMethod: { type: String, default: 'phone' },
  intendedUse: String,
  referenceImage: String,

  // Consultation specific fields
  interest: [String],
  roomType: String,
  budgetRange: String,
  timeline: String,
  mode: String,
  preferredDate: Date,
  timeWindow: String,
  altDate: Date,
  altTimeWindow: String,
  language: { type: String, default: 'en' },
  whatsappOptIn: { type: Boolean, default: false },
  consentAt: Date,
  serviceable: { type: Boolean, default: true },
  attachments: [String],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  internalNotes: [{
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    byName: String,
    at: { type: Date, default: Date.now },
    text: String
  }],
  scheduledAt: Date,
  utm: {
    source: String,
    medium: String,
    campaign: String
  },
  source: { type: String, default: 'website' },
  ip: String,
  emailSent: { type: Boolean, default: false }
}, { timestamps: true });

LeadSchema.index({ kind: 1, status: 1, createdAt: -1 });
LeadSchema.index({ reference: 1 }, { unique: true, sparse: true });
LeadSchema.index({ phone: 1, preferredDate: 1 });
ReturnRequestSchema.index({ userId: 1, createdAt: -1 });
ReturnRequestSchema.index({ orderId: 1 }, { unique: true });

export const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);
export const Shipment = mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
export const Installation = mongoose.models.Installation || mongoose.model('Installation', InstallationSchema);
export const WarrantyPolicy = mongoose.models.WarrantyPolicy || mongoose.model('WarrantyPolicy', WarrantyPolicySchema);
export const ProductRegistration = mongoose.models.ProductRegistration || mongoose.model('ProductRegistration', ProductRegistrationSchema);
export const WarrantyExtension = mongoose.models.WarrantyExtension || mongoose.model('WarrantyExtension', WarrantyExtensionSchema);
export const WarrantyClaim = mongoose.models.WarrantyClaim || mongoose.model('WarrantyClaim', ClaimSchema);
export const ClaimEvent = mongoose.models.ClaimEvent || mongoose.model('ClaimEvent', ClaimEventSchema);
export const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', ReturnRequestSchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
