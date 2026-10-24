import { connectDB } from '@/lib/db';
import { Banner } from '@/models/index';
import { ok } from '@/lib/http';
import { IMG } from '@/lib/images';

export const fallbackBanners = [
  {
    id: 'banner-diwali-dhamaka',
    name: 'Diwali Dhamaka Offer',
    title: 'Diwali Dhamaka Offer',
    subtitle: 'Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech',
    description: 'Celebrate with Up to 40% OFF + Handcrafted Teak & Smart Inverter Tech in Prayagraj',
    campaignTag: '🪔 DIWALI DHAMAKA SALE',
    ctaText: 'Tap to Claim on WhatsApp',
    href: '/offers',
    desktopImage: '/images/diwali-dhamaka-banner.jpg',
    mobileImage: '/images/diwali-dhamaka-banner.jpg',
    alt: 'RF Riddhy Diwali Dhamaka Offer - Luxury Teak Furniture & Smart Home Appliances',
    active: true,
    sortOrder: 1,
    offerCode: 'DIWALI10',
    offerDescription: 'Instant 10% OFF + Free Delivery & Setup in Prayagraj',
    isOfferModal: true,
    zone: 'all'
  },
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
    sortOrder: 2,
    offerCode: 'WEDDING20',
    offerDescription: 'Flat ₹15,000 OFF on Complete Marriage Furniture & Appliance Suites',
    zone: 'home-hero'
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
    sortOrder: 3,
    offerCode: 'APPLIANCE15',
    offerDescription: 'Up to ₹8,000 Exchange Bonus on 5-Star Inverter Appliances',
    zone: 'home-hero'
  }
];

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const zone = url.searchParams.get('zone');
    const isAll = !zone || zone === 'all' || url.searchParams.get('all') === 'true';

    await connectDB();
    const now = new Date();

    const dateFilter = {
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] }
      ]
    };

    const query = {
      active: true,
      ...dateFilter,
      ...(isAll ? {} : { zone })
    };

    let banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();

    if (banners && banners.length > 0) {
      return ok(banners.map((b) => ({ ...b, id: String(b._id) })));
    }

    return ok(fallbackBanners);
  } catch (err) {
    return ok(fallbackBanners);
  }
}
