import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Banner, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

const schema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2).max(120),
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    zone: z.string().min(2).max(80).default('all'),
    desktopImage: z.string().min(1),
    mobileImage: z.string().optional().nullable(),
    href: z.string().default('/offers'),
    ctaText: z.string().default('Shop Now'),
    campaignTag: z.string().optional().nullable(),
    alt: z.string().max(200).default('Promotional Banner'),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    active: z.boolean().default(true),
    sortOrder: z.coerce.number().default(0),
    offerCode: z.string().optional().nullable(),
    offerDescription: z.string().optional().nullable(),
    isOfferModal: z.boolean().default(true)
  })
  .refine((data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt, {
    message: 'Campaign end must be after its start.'
  });

const DEFAULT_SEED_BANNERS = [
  {
    name: 'Diwali Dhamaka Offer',
    title: 'Diwali Dhamaka Offer',
    subtitle: 'Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech',
    description: 'Celebrate with Up to 40% OFF + Handcrafted Teak & Smart Inverter Tech in Prayagraj',
    campaignTag: '🪔 DIWALI DHAMAKA SALE',
    ctaText: 'Tap to Claim on WhatsApp',
    href: '/offers',
    desktopImage: '/images/diwali-dhamaka-banner.jpg',
    mobileImage: '/images/diwali-dhamaka-banner.jpg',
    zone: 'all',
    isOfferModal: true,
    offerCode: 'DIWALI10',
    offerDescription: 'Instant 10% OFF + Free Delivery & Setup in Prayagraj',
    active: true,
    sortOrder: 1,
    alt: 'RF Riddhy Diwali Dhamaka Offer - Luxury Teak Furniture & Smart Home Appliances'
  },
  {
    name: 'Royal Wedding Season Special',
    title: 'Marriage & Home Packages',
    subtitle: 'Everything for your new beginning',
    description: 'Up to 35% savings on complete 1BHK, 2BHK & luxury bedroom suites with smart home appliances.',
    campaignTag: '💍 WEDDING SEASON SPECIAL',
    ctaText: 'Explore Packages',
    href: '/packages',
    desktopImage: '/images/hero-desktop.webp',
    mobileImage: '/images/hero-mobile.webp',
    zone: 'home-hero',
    isOfferModal: false,
    offerCode: 'WEDDING20',
    offerDescription: 'Flat ₹15,000 OFF on Complete Marriage Furniture & Appliance Suites',
    active: true,
    sortOrder: 2,
    alt: 'RF Riddhy Wedding Furniture & Appliances Collection'
  },
  {
    name: 'Smart Kitchen & Appliance Carnival',
    title: 'Power Your Everyday',
    subtitle: 'Refrigeration, Laundry & Kitchen Tech',
    description: 'Convertible inverter refrigerators, AI steam washers & convection microwave suites with extended warranty.',
    campaignTag: '⚡ APPLIANCE CARNIVAL',
    ctaText: 'Shop Appliances',
    href: '/appliances',
    desktopImage: '/images/hero-desktop.webp',
    mobileImage: '/images/hero-mobile.webp',
    zone: 'home-hero',
    isOfferModal: false,
    offerCode: 'APPLIANCE15',
    offerDescription: 'Up to ₹8,000 Exchange Bonus on 5-Star Inverter Appliances',
    active: true,
    sortOrder: 3,
    alt: 'RF Riddhy Home Appliances Showcase'
  }
];

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    if (!process.env.MONGODB_URI) {
      const { fallbackBanners } = await import('@/app/api/banners/route');
      return ok(fallbackBanners);
    }

    await connectDB();
    const zone = new URL(request.url).searchParams.get('zone');
    let items = await Banner.find(zone ? { zone } : {}).sort({ sortOrder: 1, createdAt: -1 }).lean();

    // Auto-seed if database has no banners so admin can immediately view and edit them
    if (!items || items.length === 0) {
      const totalCount = await Banner.countDocuments({});
      if (totalCount === 0) {
        await Banner.insertMany(DEFAULT_SEED_BANNERS);
        items = await Banner.find(zone ? { zone } : {}).sort({ sortOrder: 1, createdAt: -1 }).lean();
      }
    }

    return ok(items.map((item) => ({ ...item, id: String(item._id) })));
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const body = await jsonBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail('Banner settings are invalid.', 400, parsed.error.flatten());
  }

  try {
    await connectDB();
    const data = parsed.data;

    // If an ID is provided, treat as edit/update
    if (data.id) {
      const banner = await Banner.findByIdAndUpdate(data.id, { $set: data }, { new: true });
      if (!banner) return fail('Banner not found.', 404);

      await AuditLog.create({
        actorId: actor.sub,
        actorEmail: actor.email,
        action: 'banner.update',
        entity: 'Banner',
        entityId: data.id,
        after: data
      }).catch(() => {});

      return ok({ id: String(banner._id), name: banner.name, banner }, 200);
    }

    const banner = await Banner.create(data);

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'banner.create',
      entity: 'Banner',
      entityId: String(banner._id),
      after: data
    }).catch(() => {});

    return ok({ id: String(banner._id), name: banner.name, banner }, 201);
  } catch (error) {
    return fail(error.message, 400);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const body = await jsonBody(request);
  const { id, ...update } = body;
  if (!id) return fail('Banner ID required.', 400);

  try {
    await connectDB();
    const banner = await Banner.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!banner) return fail('Banner not found.', 404);

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'banner.update',
      entity: 'Banner',
      entityId: id,
      after: update
    }).catch(() => {});

    return ok({ id, active: banner.active, banner });
  } catch (error) {
    return fail(error.message, 400);
  }
}

export async function DELETE(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return fail('Banner ID required.', 400);

  try {
    await connectDB();
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return fail('Banner not found.', 404);

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'banner.delete',
      entity: 'Banner',
      entityId: id
    }).catch(() => {});

    return ok({ message: 'Banner deleted successfully.' });
  } catch (error) {
    return fail(error.message, 500);
  }
}
