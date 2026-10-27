import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "company" },
    legalName: {
      type: String,
      default: "RF Riddhy Furniture & Appliances",
    },
    tradeName: { type: String, default: "RF Riddhy" },
    gstin: { type: String, default: "09AAAAA0000A1Z5" },
    pan: { type: String, default: "AAAAA0000A" },
    state: { type: String, default: "Uttar Pradesh" },
    stateCode: { type: String, default: "09" },
    jurisdictionCity: { type: String, default: "Prayagraj" },
    addressLine1: {
      type: String,
      default: "Mansoorabad",
    },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "Prayagraj" },
    pincode: { type: String, default: "229411" },
    phone: { type: String, default: "+91 88402 45188" },
    email: { type: String, default: "riddhyfurnitureshomeappliances@gmail.com" },
    invoicePrefix: { type: String, default: "RF" },
    creditNotePrefix: { type: String, default: "CN" },
    invoiceTiming: {
      type: String,
      enum: ["paid", "dispatch"],
      default: "paid",
    },
    defaultWarehouseCode: { type: String, default: "PRAYAGRAJ-01" },
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
      default:
        "Returns accepted within 7 days in original packaging subject to inspection.",
    },
    invoiceTerms: {
      type: String,
      default:
        "1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. All disputes subject to Prayagraj jurisdiction.",
    },
    invoiceFooterNote: {
      type: String,
      default:
        "Thank you for choosing RF Riddhy. For support & warranty, email riddhyfurnitureshomeappliances@gmail.com or WhatsApp +91 88402 45188. Delivery & installation in Prayagraj.",
    },
    nextInvoiceNumber: { type: Number, default: 1 },
    updatedBy: Schema.Types.ObjectId,
    updatedByEmail: String,
  },
  { timestamps: true },
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
