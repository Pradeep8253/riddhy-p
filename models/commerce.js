import mongoose from "mongoose";
const { Schema } = mongoose;
const orderStatuses = [
  "draft_cart",
  "reserved",
  "payment_pending",
  "paid",
  "confirmed",
  "processing",
  "packed",
  "ready_for_dispatch",
  "shipped",
  "out_for_delivery",
  "delivered",
  "installation_scheduled",
  "installed",
  "completed",
  "payment_failed",
  "cancelled",
  "delivery_failed",
  "return_requested",
  "returned",
  "refund_pending",
  "refunded",
];
const itemSnapshot = new Schema(
  {
    productId: Schema.Types.ObjectId,
    variantId: Schema.Types.ObjectId,
    name: { type: String, required: true },
    slug: String,
    image: String,
    variant: Schema.Types.Mixed,
    sku: { type: String, required: true },
    qty: { type: Number, min: 1, required: true },
    unitPrice: { type: Number, required: true },
    mrp: Number,
    tax: Number,
    discount: Number,
    lineTotal: Number,
    warrantySnapshot: Schema.Types.Mixed,
  },
  { _id: false, strict: true },
);
const addressSnapshot = new Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  { _id: false },
);
const WarehouseSchema = new Schema(
  {
    code: { type: String, unique: true },
    name: String,
    address: Schema.Types.Mixed,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const InventorySchema = new Schema(
  {
    variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    available: { type: Number, min: 0, default: 0 },
    reserved: { type: Number, min: 0, default: 0 },
    lowStockAt: { type: Number, default: 5 },
  },
  { timestamps: true },
);
InventorySchema.index({ variantId: 1, warehouseId: 1 }, { unique: true });
const StockMovementSchema = new Schema(
  {
    variantId: Schema.Types.ObjectId,
    warehouseId: Schema.Types.ObjectId,
    orderId: Schema.Types.ObjectId,
    kind: {
      type: String,
      enum: [
        "opening",
        "reserve",
        "release",
        "sale",
        "return",
        "adjustment",
        "purchase",
        "damage",
        "transfer",
      ],
    },
    quantity: Number,
    reference: String,
    actorId: Schema.Types.ObjectId,
  },
  { timestamps: true },
);
const CartSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    sessionId: String,
    items: [
      {
        variantId: Schema.Types.ObjectId,
        sku: String,
        qty: Number,
        addedAt: Date,
      },
    ],
  },
  { timestamps: true },
);
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
const ReservationSchema = new Schema(
  {
    orderId: Schema.Types.ObjectId,
    variantId: Schema.Types.ObjectId,
    warehouseId: Schema.Types.ObjectId,
    qty: Number,
    status: {
      type: String,
      enum: ["active", "consumed", "released"],
      default: "active",
    },
    expiresAt: { type: Date, required: true },
    purgeAt: { type: Date },
  },
  { timestamps: true },
);
// Expiry is processed by application logic first; this TTL index only purges completed reservation records.
ReservationSchema.index(
  { purgeAt: 1 },
  { expireAfterSeconds: 0, sparse: true },
);
const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    checkoutKey: { type: String, unique: true, sparse: true },
    checkoutFingerprint: String,
    userId: Schema.Types.ObjectId,
    email: String,
    phone: String,
    status: { type: String, enum: orderStatuses, default: "draft_cart" },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "offline"],
      default: "razorpay",
    },
    items: { type: [itemSnapshot], immutable: true },
    shippingAddress: addressSnapshot,
    billingAddress: addressSnapshot,
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    installationFee: Number,
    discount: Number,
    total: Number,
    refundedAmount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    couponCode: String,
    notes: String,
    buyerGstin: String,
    buyerBusinessName: String,
    isB2B: { type: Boolean, default: false },
    invoiceNumber: String,
    invoiceId: Schema.Types.ObjectId,
    deliveredAt: Date,
    installedAt: Date,
    codCollectedAt: Date,
    offlinePayment: {
      amount: Number,
      mode: String,
      reference: String,
      receivedAt: Date,
      notes: String,
    },
    timeline: [
      {
        status: String,
        at: Date,
        note: String,
        by: Schema.Types.ObjectId,
        byEmail: String,
      },
    ],
  },
  { timestamps: true },
);
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentMethod: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ invoiceNumber: 1 }, { sparse: true });

const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: { type: String, default: "razorpay" },
    providerOrderId: { type: String, unique: true, sparse: true },
    providerPaymentId: { type: String, unique: true, sparse: true },
    amount: Number,
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },
    signature: String,
    method: String,
  },
  { timestamps: true },
);
const PaymentEventSchema = new Schema(
  {
    provider: String,
    eventId: { type: String, unique: true },
    type: String,
    paymentId: String,
    orderId: String,
    payload: Schema.Types.Mixed,
    processedAt: Date,
  },
  { timestamps: true },
);
const RefundSchema = new Schema(
  {
    orderId: Schema.Types.ObjectId,
    paymentId: Schema.Types.ObjectId,
    providerRefundId: { type: String, unique: true, sparse: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ["requested", "processed", "failed"],
      default: "requested",
    },
    requestedBy: Schema.Types.ObjectId,
  },
  { timestamps: true },
);

const InvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    financialYear: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    invoiceDate: { type: Date, default: Date.now },
    seller: {
      name: { type: String, required: true },
      address: String,
      city: String,
      state: String,
      stateCode: String,
      pincode: String,
      gstin: String,
      pan: String,
      phone: String,
      email: String,
      bankName: String,
      accountNo: String,
      ifsc: String,
      upiId: String,
      jurisdictionCity: String,
      logoUrl: String,
      signatureUrl: String,
    },
    buyer: {
      name: { type: String, required: true },
      phone: String,
      email: String,
      gstin: String,
      businessName: String,
      isB2B: { type: Boolean, default: false },
      billingAddress: addressSnapshot,
      shippingAddress: addressSnapshot,
      state: String,
      stateCode: String,
    },
    items: [
      {
        productId: Schema.Types.ObjectId,
        variantId: Schema.Types.ObjectId,
        sku: String,
        name: String,
        hsn: { type: String, default: "9403" },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        taxableValue: { type: Number, required: true },
        gstRate: { type: Number, default: 18 },
        cgstRate: { type: Number, default: 0 },
        cgstAmount: { type: Number, default: 0 },
        sgstRate: { type: Number, default: 0 },
        sgstAmount: { type: Number, default: 0 },
        igstRate: { type: Number, default: 0 },
        igstAmount: { type: Number, default: 0 },
        lineTotal: { type: Number, required: true },
        isService: { type: Boolean, default: false },
      },
    ],
    taxableAmount: { type: Number, required: true },
    cgstTotal: { type: Number, default: 0 },
    sgstTotal: { type: Number, default: 0 },
    igstTotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryTaxable: { type: Number, default: 0 },
    deliveryGstRate: { type: Number, default: 18 },
    deliverySac: { type: String, default: "9965" },
    installationFee: { type: Number, default: 0 },
    installationTaxable: { type: Number, default: 0 },
    installationGstRate: { type: Number, default: 18 },
    installationSac: { type: String, default: "9987" },
    roundOff: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    totalInWords: String,
    placeOfSupply: String,
    jurisdictionCity: { type: String, default: "Prayagraj" },
    isInterState: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partially_paid", "refunded"],
      default: "paid",
    },
    paymentMode: { type: String, default: "online" },
    paymentReference: String,
    status: {
      type: String,
      enum: ["issued", "cancelled", "void"],
      default: "issued",
    },
    creditNoteId: Schema.Types.ObjectId,
    creditNotes: [{ type: Schema.Types.ObjectId, ref: "CreditNote" }],
    hsnSummary: [
      {
        hsn: String,
        description: String,
        taxableValue: Number,
        gstRate: Number,
        cgstAmount: Number,
        sgstAmount: Number,
        igstAmount: Number,
        totalTax: Number,
      },
    ],
    events: [
      {
        action: String,
        at: { type: Date, default: Date.now },
        by: String,
        byEmail: String,
        note: String,
      },
    ],
    terms: String,
    notes: String,
  },
  { timestamps: true },
);
InvoiceSchema.index({ orderId: 1 }, { unique: true });
InvoiceSchema.index({ invoiceDate: -1 });

const CreditNoteSchema = new Schema(
  {
    creditNoteNumber: { type: String, unique: true, required: true },
    financialYear: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: Date,
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: String,
    amount: { type: Number, required: true },
    taxableAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    isInterState: { type: Boolean, default: false },
    gstRate: { type: Number, default: 18 },
    seller: Schema.Types.Mixed,
    buyer: Schema.Types.Mixed,
    items: [Schema.Types.Mixed],
    reason: String,
    issuedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["issued", "applied", "void"],
      default: "issued",
    },
    notes: String,
  },
  { timestamps: true },
);
CreditNoteSchema.index({ invoiceId: 1 });

const SequenceCounterSchema = new Schema(
  {
    series: { type: String, required: true },
    financialYear: { type: String, required: true },
    lastNumber: { type: Number, default: 0 },
  },
  { timestamps: true },
);
SequenceCounterSchema.index({ series: 1, financialYear: 1 }, { unique: true });

export const Warehouse =
  mongoose.models.Warehouse || mongoose.model("Warehouse", WarehouseSchema);
export const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
if (mongoose.models?.StockMovement) {
  delete mongoose.models.StockMovement;
}
export const StockMovement =
  mongoose.models.StockMovement ||
  mongoose.model("StockMovement", StockMovementSchema);
export const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
export const Reservation =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);
export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export const PaymentEvent =
  mongoose.models.PaymentEvent ||
  mongoose.model("PaymentEvent", PaymentEventSchema);
export const Refund =
  mongoose.models.Refund || mongoose.model("Refund", RefundSchema);
export const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export const CreditNote =
  mongoose.models.CreditNote || mongoose.model("CreditNote", CreditNoteSchema);
export const SequenceCounter =
  mongoose.models.SequenceCounter ||
  mongoose.model("SequenceCounter", SequenceCounterSchema);
export { orderStatuses };
