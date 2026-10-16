import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Banner, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

const schema = z
  .object({
    name: z.string().min(3).max(120),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    zone: z.string().min(2).max(80).default('home-hero'),
    desktopImage: z.string().min(1),
    mobileImage: z.string().optional(),
    href: z.string().default('/offers'),
    ctaText: z.string().default('Shop Now'),
    campaignTag: z.string().optional(),
    alt: z.string().min(3).max(200).default('Promotional Banner'),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    active: z.boolean().default(true),
    sortOrder: z.coerce.number().default(0)
  })
  .refine((data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt, {
    message: 'Campaign end must be after its start.'
  });

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
    const items = await Banner.find(zone ? { zone } : {}).sort({ sortOrder: 1, createdAt: -1 }).lean();
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
    const banner = await Banner.create(data);

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: 'banner.create',
      entity: 'Banner',
      entityId: String(banner._id),
      after: data
    }).catch(() => {});

    return ok({ id: String(banner._id), name: banner.name }, 201);
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

    return ok({ id, active: banner.active });
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
