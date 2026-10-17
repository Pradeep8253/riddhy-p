import { connectDB } from '@/lib/db';
import { Banner } from '@/models/index';
import { ok } from '@/lib/http';
import { IMG } from '@/lib/images';

export const fallbackBanners = [
  {
    id: 'banner-wedding-season',
    name: 'Wedding Season Special',
    title: 'Marriage & Home Packages',
    subtitle: 'Everything for your new beginning',
    description: 'Up to 35% savings on complete 1BHK, 2BHK & luxury bedroom suites with smart home appliances.',
    campaignTag: '💍 WEDDING SEASON SPECIAL',
    ctaText: 'Explore Packages',
    href: '/packages',
    desktopImage: IMG.hero.desktop,
    mobileImage: IMG.hero.mobile,
    alt: 'RF Riddhy Wedding Furniture & Appliances Collection',
    active: true,
    sortOrder: 1
  },
  {
    id: 'banner-festive-deal',
    name: 'The Golden Hour Festive Deal',
    title: 'Warmth, Comfort & Craft',
    subtitle: 'Curated for real Indian living rooms',
    description: 'Solid Sheesham and CP Teak craftsmanship paired with 5-star energy efficient inverter appliances.',
    campaignTag: '✨ FESTIVAL OF HOME',
    ctaText: 'Shop Furniture',
    href: '/furniture',
    desktopImage: IMG.hero.desktop,
    mobileImage: IMG.hero.mobile,
    alt: 'RF Riddhy Living Room Festive Deal',
    active: true,
    sortOrder: 2
  },
  {
    id: 'banner-smart-appliances',
    name: 'Smart Kitchen & Care Suite',
    title: 'Power Your Everyday',
    subtitle: 'Refrigeration, Laundry & Kitchen Tech',
    description: 'Convertible inverter refrigerators, AI steam washers & convection microwave suites with extended warranty.',
    campaignTag: '⚡ APPLIANCE CARNIVAL',
    ctaText: 'Shop Appliances',
    href: '/appliances',
    desktopImage: IMG.hero.desktop,
    mobileImage: IMG.hero.mobile,
    alt: 'RF Riddhy Home Appliances Showcase',
    active: true,
    sortOrder: 3
  }
];

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const zone = url.searchParams.get('zone') || 'home-hero';

    if (!process.env.MONGODB_URI) {
      return ok(fallbackBanners);
    }

    await connectDB();
    const now = new Date();

    const query = {
      zone,
      active: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] }
      ]
    };

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 }).limit(10).lean();

    if (banners && banners.length > 0) {
      return ok(banners.map((b) => ({ ...b, id: String(b._id) })));
    }

    return ok(fallbackBanners);
  } catch (err) {
    return ok(fallbackBanners);
  }
}
