import { connectDB } from '@/lib/db';
import { SiteSetting } from '@/models/index';
import { siteConfig } from '@/lib/site-config';

/**
 * Server-only helper to fetch live site configuration from MongoDB
 * with seamless fallback to environment variables (siteConfig).
 */
export async function getLiveSiteConfig() {
  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key: 'site_config' }).lean();
    if (!doc) return siteConfig;

    return {
      ...siteConfig,
      contact: {
        ...siteConfig.contact,
        phone: doc.contact?.phone || doc.company?.phone || siteConfig.contact.phone,
        whatsapp: doc.contact?.whatsapp || doc.company?.phone || siteConfig.contact.whatsapp,
        email: doc.contact?.email || doc.company?.email || siteConfig.contact.email,
        responseTime: doc.contact?.responseTime || siteConfig.contact.responseTime,
        hours: doc.contact?.hours || siteConfig.contact.hours,
        holidaysNotice: doc.contact?.holidaysNotice || siteConfig.contact.holidaysNotice
      },
      showroom: {
        ...siteConfig.showroom,
        name: doc.showroom?.name || doc.company?.tradeName || siteConfig.showroom.name,
        addressLine1: doc.showroom?.addressLine1 || doc.company?.addressLine1 || siteConfig.showroom.addressLine1 || 'Civil Lines, MG Marg',
        city: doc.showroom?.city || doc.company?.city || siteConfig.showroom.city || 'Prayagraj',
        state: doc.showroom?.state || doc.company?.state || siteConfig.showroom.state || 'Uttar Pradesh',
        pincode: doc.showroom?.pincode || doc.company?.pincode || siteConfig.showroom.pincode || '211001',
        country: doc.showroom?.country || 'India',
        mapUrl: doc.showroom?.mapUrl || siteConfig.showroom.mapUrl,
        hours: doc.showroom?.hours || doc.contact?.hours || siteConfig.showroom.hours
      },
      consultation: {
        ...siteConfig.consultation,
        capacityPerSlot: doc.consultation?.capacityPerSlot ?? siteConfig.consultation.capacityPerSlot,
        modes: {
          phone: true,
          video: true,
          showroom: Boolean(doc.showroom?.addressLine1 || siteConfig.showroom.addressLine1),
          home: doc.consultation?.homeVisit !== undefined ? doc.consultation.homeVisit : siteConfig.consultation.modes.home
        }
      },
      story: {
        ...siteConfig.story,
        foundedYear: doc.story?.foundedYear || siteConfig.story.foundedYear,
        originCity: doc.story?.originCity || siteConfig.story.originCity,
        founderNarrative: doc.story?.founderNarrative || siteConfig.story.founderNarrative,
        metrics: {
          homesFurnished: doc.story?.metrics?.homesFurnished || siteConfig.story.metrics.homesFurnished,
          pincodesServed: doc.story?.metrics?.pincodesServed || siteConfig.story.metrics.pincodesServed,
          satisfactionRate: doc.story?.metrics?.satisfactionRate || siteConfig.story.metrics.satisfactionRate
        },
        partnerBrands: Array.isArray(doc.story?.partnerBrands) && doc.story.partnerBrands.length > 0
          ? doc.story.partnerBrands
          : siteConfig.story.partnerBrands
      }
    };
  } catch (error) {
    // Database unconfigured or unavailable — return env defaults
    return siteConfig;
  }
}
