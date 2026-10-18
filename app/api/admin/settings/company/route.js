import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Settings, SiteSetting, Warehouse, AuditLog } from "@/models/index";
import { requireAdmin } from "@/lib/roles";
import { ok, fail, jsonBody } from "@/lib/http";
import {
  getCompanySettings,
  invalidateCompanySettingsCache,
} from "@/lib/company-settings";

const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
const PINCODE_REGEX = /^\d{6}$/;

const companySettingsSchema = z
  .object({
    legalName: z.string().min(2, "Legal business name is required").max(200),
    tradeName: z.string().min(2, "Trade name is required").max(100),
    gstin: z
      .string()
      .trim()
      .regex(GSTIN_REGEX, "Invalid GSTIN format (e.g. 07AAAAA0000A1Z5)"),
    pan: z
      .string()
      .trim()
      .regex(PAN_REGEX, "Invalid PAN format (e.g. AAAAA0000A)"),
    state: z.string().min(2, "State is required").max(60),
    stateCode: z
      .string()
      .trim()
      .regex(/^\d{2}$/, "State code must be exactly 2 digits (e.g. 07)"),
    addressLine1: z.string().min(5, "Address Line 1 is required").max(250),
    addressLine2: z.string().max(250).optional().default(""),
    city: z.string().min(2, "City is required").max(80),
    pincode: z
      .string()
      .trim()
      .regex(PINCODE_REGEX, "Pincode must be exactly 6 digits"),
    phone: z.string().trim().min(8, "Valid contact phone is required").max(25),
    email: z.string().trim().email("Valid billing email is required"),
    invoicePrefix: z.string().trim().min(1).max(10).default("RF"),
    invoiceTiming: z.enum(["paid", "dispatch"]).default("paid"),
    defaultWarehouseCode: z.string().trim().min(2).max(30).default("DELHI-01"),
    currency: z.string().trim().length(3).default("INR"),
    logoUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
    website: z
      .string()
      .trim()
      .url()
      .or(z.literal(""))
      .optional()
      .default("https://rfriddhy.com"),
    bankName: z.string().trim().max(100).optional().default(""),
    accountNo: z.string().trim().max(50).optional().default(""),
    ifsc: z.string().trim().max(20).optional().default(""),
    upiId: z.string().trim().max(50).optional().default(""),
    invoiceTerms: z.string().max(2000).optional().default(""),
    invoiceFooterNote: z.string().max(500).optional().default(""),
    nextInvoiceNumber: z.coerce.number().int().min(1).optional().default(1),
  })
  .refine(
    (data) => {
      if (data.gstin && data.stateCode) {
        return data.gstin.slice(0, 2) === data.stateCode;
      }
      return true;
    },
    {
      message: "State code must match the first 2 digits of the GSTIN",
      path: ["stateCode"],
    },
  );

export async function GET() {
  const actor = await requireAdmin(
    new Set(["super-admin", "admin", "finance"]),
  );
  if (!actor) return fail("Admin or Super-admin permission required.", 403);

  try {
    await connectDB();
    const settings = await getCompanySettings();
    const warehouseDocs = await Warehouse.find({ active: true })
      .select("code name city")
      .lean()
      .catch(() => []);
    const warehouses =
      warehouseDocs && warehouseDocs.length > 0
        ? warehouseDocs
        : [
            {
              code: "DELHI-01",
              name: "Okhla Fulfillment Hub (Delhi)",
              city: "Delhi",
            },
            {
              code: "MUMBAI-01",
              name: "Bhiwandi Central Warehouse (Mumbai)",
              city: "Mumbai",
            },
            {
              code: "BLR-01",
              name: "Peenya Distribution Node (Bengaluru)",
              city: "Bengaluru",
            },
          ];

    return ok({ settings, warehouses });
  } catch (err) {
    return fail(`Failed to fetch company settings: ${err.message}`, 500);
  }
}

export async function PUT(request) {
  const actor = await requireAdmin(new Set(["super-admin", "admin"]));
  if (!actor)
    return fail(
      "Super-admin permission required to update company and tax settings.",
      403,
    );

  const body = await jsonBody(request);
  const parsed = companySettingsSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "Validation error in company settings",
      422,
      parsed.error.flatten(),
    );
  }

  const updateData = {
    ...parsed.data,
    key: "company",
    updatedBy: actor.id,
    updatedByEmail: actor.email,
  };

  try {
    await connectDB();

    const oldDoc = await Settings.findOne({ key: "company" }).lean();

    const updated = await Settings.findOneAndUpdate(
      { key: "company" },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    // Also mirror to SiteSetting.company for complete system-wide consistency
    await SiteSetting.findOneAndUpdate(
      { key: "site_config" },
      { $set: { company: updateData } },
    ).catch(() => {});

    // Compute changed fields for detailed audit logging
    const changedFields = [];
    if (oldDoc) {
      for (const [key, val] of Object.entries(parsed.data)) {
        if (oldDoc[key] !== val) {
          changedFields.push(key);
        }
      }
    }

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "settings.update",
      entity: "Settings",
      entityId: "company",
      changes: {
        changedFields,
        summary: `Updated ${changedFields.length} company settings: ${changedFields.join(", ")}`,
      },
      before: oldDoc,
      after: updated,
    }).catch(() => {});

    // Invalidate in-memory cache
    invalidateCompanySettingsCache();

    return ok({
      settings: updated,
      message:
        "Company legal identity and invoice settings updated successfully.",
    });
  } catch (error) {
    return fail(`Failed to save company settings: ${error.message}`, 500);
  }
}
