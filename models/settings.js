import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "company" },
    legalName: {
      type: String,
      default: "RF Riddhy Furniture & Appliances Pvt Ltd",
    },
    tradeName: { type: String, default: "RF Riddhy" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    state: { type: String, default: "Delhi" },
    stateCode: { type: String, default: "07" },
    jurisdictionCity: { type: String, default: "New Delhi" },
    addressLine1: {
      type: String,
      default: "Plot 42, Okhla Industrial Area Phase III",
    },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "New Delhi" },
    pincode: { type: String, default: "110020" },
    phone: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "billing@rfriddhy.com" },
    invoicePrefix: { type: String, default: "RF" },
    creditNotePrefix: { type: String, default: "CN" },
    invoiceTiming: {
      type: String,
      enum: ["paid", "dispatch"],
      default: "paid",
    },
    defaultWarehouseCode: { type: String, default: "DELHI-01" },
    currency: { type: String, default: "INR" },
    logoUrl: { type: String, default: "" },
    signatureUrl: { type: String, default: "" },
    website: { type: String, default: "https://rfriddhy.com" },
    bankName: { type: String, default: "" },
    accountNo: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    upiId: { type: String, default: "" },
    defaultGstRate: { type: Number, default: 18 },
    deliverySac: { type: String, default: "9965" },
    installationSac: { type: String, default: "9987" },
    returnPolicyText: {
      type: String,
      default: "Returns accepted within 7 days in original packaging subject to inspection.",
    },
    invoiceTerms: {
      type: String,
      default:
        "1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. All disputes subject to local jurisdiction.",
    },
    invoiceFooterNote: {
      type: String,
      default:
        "Thank you for choosing RF Riddhy. For support & warranty, email care@riddhy.in or WhatsApp +91 99342 08035.",
    },
    nextInvoiceNumber: { type: Number, default: 1 },
    updatedBy: Schema.Types.ObjectId,
    updatedByEmail: String,
  },
  { timestamps: true },
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
