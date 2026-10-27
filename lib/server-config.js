import { connectDB } from "@/lib/db";
import { SiteSetting, Settings } from "@/models/index";
import { siteConfig } from "@/lib/site-config";

/**
 * Server-only helper to fetch live site configuration from MongoDB
 * with seamless fallback to company settings and environment variables.
 */
export async function getLiveSiteConfig() {
  try {
    await connectDB();
    const [doc, companyDoc] = await Promise.all([
      SiteSetting.findOne({ key: "site_config" })
        .lean()
        .catch(() => null),
      Settings.findOne({ key: "company" })
        .lean()
        .catch(() => null),
    ]);

    const activePhone =
      doc?.contact?.phone ||
      companyDoc?.phone ||
      doc?.company?.phone ||
      siteConfig.contact.phone ||
      "+91 88402 45188";

    const activeWhatsapp =
      doc?.contact?.whatsapp ||
      companyDoc?.phone ||
      doc?.company?.phone ||
      siteConfig.contact.whatsapp ||
      "+91 88402 45188";

    const activeEmail =
      doc?.contact?.email ||
      companyDoc?.email ||
      doc?.company?.email ||
      siteConfig.contact.email ||
      "riddhyfurnitureshomeappliances@gmail.com";

    const activeCity =
      doc?.showroom?.city ||
      companyDoc?.city ||
      siteConfig.showroom.city ||
      "Prayagraj";

    const activeAddress =
      doc?.showroom?.addressLine1 ||
      companyDoc?.addressLine1 ||
      siteConfig.showroom.addressLine1 ||
      "Mansoorabad";

    const activeState =
      doc?.showroom?.state ||
      companyDoc?.state ||
      siteConfig.showroom.state ||
      "Uttar Pradesh";

    const activePincode =
      doc?.showroom?.pincode ||
      companyDoc?.pincode ||
      siteConfig.showroom.pincode ||
      "229411";

    const activeTradeName =
      doc?.showroom?.name ||
      companyDoc?.tradeName ||
      doc?.company?.tradeName ||
      siteConfig.showroom.name ||
      "RF Riddhy";

    return {
      ...siteConfig,
      brandName: activeTradeName,
      contact: {
        ...siteConfig.contact,
        phone: activePhone,
        whatsapp: activeWhatsapp,
        email: activeEmail,
        responseTime:
          doc?.contact?.responseTime ||
          siteConfig.contact.responseTime ||
          "Within 2 Hours",
        hours:
          doc?.contact?.hours ||
          companyDoc?.storeHours ||
          siteConfig.contact.hours ||
          "10:00 AM – 8:30 PM (Open 7 Days)",
        holidaysNotice:
          doc?.contact?.holidaysNotice || siteConfig.contact.holidaysNotice,
      },
      showroom: {
        ...siteConfig.showroom,
        name: activeTradeName,
        addressLine1: activeAddress,
        city: activeCity,
        state: activeState,
        pincode: activePincode,
        country: doc?.showroom?.country || companyDoc?.country || "India",
        mapUrl: doc?.showroom?.mapUrl || siteConfig.showroom.mapUrl,
        hours:
          doc?.showroom?.hours ||
          doc?.contact?.hours ||
          siteConfig.showroom.hours ||
          "10:00 AM – 8:30 PM (Open 7 Days)",
      },
      consultation: {
        ...siteConfig.consultation,
        capacityPerSlot:
          doc.consultation?.capacityPerSlot ??
          siteConfig.consultation.capacityPerSlot,
        modes: {
          phone: true,
          video: true,
          showroom: Boolean(
            doc.showroom?.addressLine1 || siteConfig.showroom.addressLine1,
          ),
          home:
            doc.consultation?.homeVisit !== undefined
              ? doc.consultation.homeVisit
              : siteConfig.consultation.modes.home,
        },
      },
      story: {
        ...siteConfig.story,
        foundedYear: doc.story?.foundedYear || siteConfig.story.foundedYear,
        originCity: doc.story?.originCity || siteConfig.story.originCity,
        founderNarrative:
          doc.story?.founderNarrative || siteConfig.story.founderNarrative,
        metrics: {
          homesFurnished:
            doc.story?.metrics?.homesFurnished ||
            siteConfig.story.metrics.homesFurnished,
          pincodesServed:
            doc.story?.metrics?.pincodesServed ||
            siteConfig.story.metrics.pincodesServed,
          satisfactionRate:
            doc.story?.metrics?.satisfactionRate ||
            siteConfig.story.metrics.satisfactionRate,
        },
        partnerBrands:
          Array.isArray(doc.story?.partnerBrands) &&
          doc.story.partnerBrands.length > 0
            ? doc.story.partnerBrands
            : siteConfig.story.partnerBrands,
      },
    };
  } catch (error) {
    // Database unconfigured or unavailable — return env defaults
    return siteConfig;
  }
}
