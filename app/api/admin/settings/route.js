import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { SiteSetting, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';
import { siteConfig } from '@/lib/site-config';

const settingsSchema = z.object({
  contact: z.object({
    phone: z.string().optional().default(''),
    whatsapp: z.string().optional().default(''),
    email: z.string().optional().default(''),
    responseTime: z.string().optional().default(''),
    hours: z.string().optional().default(''),
    holidaysNotice: z.string().optional().default('')
  }).optional(),
  showroom: z.object({
    name: z.string().optional().default('RF Riddhy Experience Store'),
    addressLine1: z.string().optional().default(''),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    pincode: z.string().optional().default(''),
    country: z.string().optional().default('India'),
    mapUrl: z.string().optional().default(''),
    hours: z.string().optional().default('')
  }).optional(),
  consultation: z.object({
    capacityPerSlot: z.coerce.number().int().min(1).max(50).optional().default(3),
    homeVisit: z.boolean().optional().default(false)
  }).optional(),
  story: z.object({
    foundedYear: z.string().optional().default(''),
    originCity: z.string().optional().default(''),
    founderNarrative: z.string().optional().default(''),
    metrics: z.object({
      homesFurnished: z.string().optional().default(''),
      pincodesServed: z.string().optional().default(''),
      satisfactionRate: z.string().optional().default('')
    }).optional(),
    partnerBrands: z.union([z.array(z.string()), z.string()]).optional()
  }).optional()
});

function getFallbackSettings() {
  return {
    contact: {
      phone: siteConfig.contact.phone || '',
      whatsapp: siteConfig.contact.whatsapp || '',
      email: siteConfig.contact.email || '',
      responseTime: siteConfig.contact.responseTime || '',
      hours: siteConfig.contact.hours || '',
      holidaysNotice: siteConfig.contact.holidaysNotice || ''
    },
    showroom: {
      name: siteConfig.showroom.name || 'RF Riddhy Experience Store',
      addressLine1: siteConfig.showroom.addressLine1 || '',
      city: siteConfig.showroom.city || '',
      state: siteConfig.showroom.state || '',
      pincode: siteConfig.showroom.pincode || '',
      country: siteConfig.showroom.country || 'India',
      mapUrl: siteConfig.showroom.mapUrl || '',
      hours: siteConfig.showroom.hours || ''
    },
    consultation: {
      capacityPerSlot: siteConfig.consultation.capacityPerSlot || 3,
      homeVisit: Boolean(siteConfig.consultation.modes.home)
    },
    story: {
      foundedYear: siteConfig.story.foundedYear || '',
      originCity: siteConfig.story.originCity || '',
      founderNarrative: siteConfig.story.founderNarrative || '',
      metrics: {
        homesFurnished: siteConfig.story.metrics.homesFurnished || '',
        pincodesServed: siteConfig.story.metrics.pincodesServed || '',
        satisfactionRate: siteConfig.story.metrics.satisfactionRate || ''
      },
      partnerBrands: siteConfig.story.partnerBrands || []
    }
  };
}

export async function GET() {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'support', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const fallback = getFallbackSettings();

  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key: 'site_config' }).lean();

    if (!doc) {
      return ok({
        settings: fallback,
        source: 'environment',
        isDefault: true
      });
    }

    // Merge doc with fallback to ensure all keys exist
    const merged = {
      contact: { ...fallback.contact, ...(doc.contact || {}) },
      showroom: { ...fallback.showroom, ...(doc.showroom || {}) },
      consultation: { ...fallback.consultation, ...(doc.consultation || {}) },
      story: {
        ...fallback.story,
        ...(doc.story || {}),
        metrics: {
          ...fallback.story.metrics,
          ...((doc.story && doc.story.metrics) || {})
        },
        partnerBrands: Array.isArray(doc.story?.partnerBrands)
          ? doc.story.partnerBrands
          : fallback.story.partnerBrands
      },
      updatedAt: doc.updatedAt,
      updatedByEmail: doc.updatedByEmail
    };

    return ok({
      settings: merged,
      source: 'database',
      isDefault: false
    });
  } catch (error) {
    // If DB is not connected, gracefully return environment settings
    return ok({
      settings: fallback,
      source: 'environment',
      isDefault: true,
      warning: 'Database is not connected. Reading fallback values from environment configuration.'
    });
  }
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Super-admin or Admin permission required.', 403);

  const body = await jsonBody(request);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Validation error in store settings', 422, parsed.error.flatten());
  }

  const data = parsed.data;

  // Process partner brands if sent as comma-separated string
  let partnerBrands = [];
  if (Array.isArray(data.story?.partnerBrands)) {
    partnerBrands = data.story.partnerBrands.map((b) => String(b).trim()).filter(Boolean);
  } else if (typeof data.story?.partnerBrands === 'string') {
    partnerBrands = data.story.partnerBrands
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
  }

  const updatePayload = {
    key: 'site_config',
    contact: data.contact || {},
    showroom: data.showroom || {},
    consultation: data.consultation || {},
    story: {
      ...(data.story || {}),
      partnerBrands
    },
    updatedBy: actor.id,
    updatedByEmail: actor.email
  };

  try {
    await connectDB();
    const updated = await SiteSetting.findOneAndUpdate(
      { key: 'site_config' },
      { $set: updatePayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UPDATE_SITE_SETTINGS',
      entity: 'SiteSetting',
      entityId: String(updated._id),
      after: updatePayload
    }).catch(() => {});

    return ok({
      settings: updated,
      message: 'Store settings and brand proof saved successfully.'
    });
  } catch (error) {
    return fail(`Could not save settings: ${error.message}`, 500);
  }
}
