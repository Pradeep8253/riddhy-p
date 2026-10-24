import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { MarriagePackage, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';
import { getLivePackages, serializePackage, defaultPackages } from '@/lib/packages-data';

export const dynamic = 'force-dynamic';

const packageSchema = z.object({
  name: z.string().min(2),
  hindiName: z.string().optional(),
  name_hi: z.string().optional(),
  slug: z.string().min(2),
  tier: z.string().default('shagun'),
  tagline: z.string().optional(),
  badgeText: z.string().optional(),
  description: z.string().min(10),
  bannerImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().optional(),
  savings: z.coerce.number().optional(),
  highlightBadge: z.string().optional(),
  categories: z.array(z.string()).default([]),
  items: z.array(z.object({
    category: z.string().optional(),
    title: z.string().min(2),
    quantity: z.coerce.number().default(1),
    productId: z.string().optional(),
    productName: z.string().optional(),
    specs: z.string().optional(),
    image: z.string().optional(),
    isOptional: z.boolean().default(false)
  })).default([]),
  customizableAddons: z.array(z.object({
    title: z.string().min(2),
    category: z.string().optional(),
    price: z.coerce.number().nonnegative(),
    description: z.string().optional(),
    image: z.string().optional(),
    includedByDefault: z.boolean().default(false)
  })).default([]),
  sortOrder: z.coerce.number().default(0),
  active: z.boolean().default(true)
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true' || searchParams.get('admin') === 'true';

  try {
    await connectDB();
    let count = await MarriagePackage.countDocuments();
    if (count === 0) {
      await getLivePackages(); // Triggers auto-seed if empty
      count = await MarriagePackage.countDocuments();
    }
    if (count > 0) {
      const query = includeAll ? {} : { active: true };
      const docs = await MarriagePackage.find(query).sort({ sortOrder: 1, price: 1 }).lean();
      return ok((docs || []).map(serializePackage));
    }
  } catch (err) {
    console.error('Error fetching packages:', err);
  }

  const packages = await getLivePackages();
  return ok(packages);
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const body = await jsonBody(request);
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Validation error in package data', 422, parsed.error.flatten());
  }

  const data = parsed.data;

  // Auto-calculate savings if not provided
  if (!data.savings && data.originalPrice && data.originalPrice > data.price) {
    data.savings = data.originalPrice - data.price;
  }

  try {
    await connectDB();
    const created = await MarriagePackage.create(data);

    await AuditLog.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CREATE_MARRIAGE_PACKAGE',
      entity: 'MarriagePackage',
      entityId: String(created._id),
      after: data
    }).catch(() => {});

    return ok(created, 201);
  } catch (error) {
    if (error.code === 11000) {
      return fail('A package with this slug already exists.', 409);
    }
    return fail(`Could not create package: ${error.message}`, 500);
  }
}
