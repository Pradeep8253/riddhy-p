import AboutHero from '@/components/store/about/AboutHero';
import AboutCategories from '@/components/store/about/AboutCategories';
import AboutWhyChooseUs from '@/components/store/about/AboutWhyChooseUs';
import AboutCommitment from '@/components/store/about/AboutCommitment';
import AboutStory from '@/components/store/about/AboutStory';
import AboutBeliefs from '@/components/store/about/AboutBeliefs';
import AboutDuo from '@/components/store/about/AboutDuo';
import AboutCareTimeline from '@/components/store/about/AboutCareTimeline';
import AboutMetrics from '@/components/store/about/AboutMetrics';
import AboutShowroom from '@/components/store/about/AboutShowroom';
import AboutPartners from '@/components/store/about/AboutPartners';
import AboutCTA from '@/components/store/about/AboutCTA';
import ReviewWall from '@/components/store/ReviewWall';
import { siteConfig, isConfigured } from '@/lib/site-config';
import { getLiveSiteConfig } from '@/lib/server-config';
import { IMG } from '@/lib/images';

export async function generateMetadata() {
  const liveConfig = await getLiveSiteConfig();
  const url = `${liveConfig.siteUrl}/about`;
  const title = 'About RF Riddhy — Furniture & Home Appliances';
  const description =
    'RF Riddhy brings thoughtfully chosen furniture and dependable home appliances together with warmth, clarity, and genuine aftercare.';

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [IMG.og || '/og-image.webp']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [IMG.og || '/og-image.webp']
    }
  };
}

export default async function AboutPage() {
  const liveConfig = await getLiveSiteConfig();

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'FurnitureStore'],
    name: liveConfig.brandName,
    url: liveConfig.siteUrl,
    logo: `${liveConfig.siteUrl}/riddhy-logo.jpeg`,
    description: 'Thoughtfully chosen furniture and dependable appliances for Indian homes.',
    ...(isConfigured(liveConfig.showroom.addressLine1)
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: liveConfig.showroom.addressLine1,
            addressLocality: liveConfig.showroom.city,
            addressRegion: liveConfig.showroom.state,
            postalCode: liveConfig.showroom.pincode,
            addressCountry: 'IN'
          }
        }
      : {}),
    ...(isConfigured(liveConfig.contact.phone)
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: liveConfig.contact.phone,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['en', 'hi']
          }
        }
      : {})
  };

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: liveConfig.brandName,
      description: 'Furniture & Home Appliances built for the way home feels.'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema).replace(/</g, '\\u003c') }}
      />

      <main>
        {/* 1. Hero & Brand Introduction */}
        <AboutHero />

        {/* 2. Product Categories Showcase */}
        <AboutCategories />

        {/* 3. Why Choose Us (5 Pillars) */}
        <AboutWhyChooseUs />

        {/* 4. Our Commitment to Reliable Service */}
        <AboutCommitment />

        {/* 5. Origin Story (hidden if unconfigured) */}
        <AboutStory config={liveConfig} />

        {/* 6. What we believe & Craft */}
        <AboutBeliefs />

        {/* 7. Furniture + Appliances Harmony */}
        <AboutDuo />

        {/* 8. Care timeline */}
        <AboutCareTimeline />

        {/* 9. Numbers & Proof (hidden if unconfigured) */}
        <AboutMetrics config={liveConfig} />

        {/* 10. Experience Showroom (hidden if unconfigured) */}
        <AboutShowroom config={liveConfig} />

        {/* 11. Customer Voices */}
        <section className="section" style={{ background: 'var(--rf-cream-50)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto clamp(32px, 5vw, 56px)' }}>
              <span className="kicker">Real spaces</span>
              <h2 style={{ margin: '10px 0 8px', font: '500 clamp(32px, 4.5vw, 52px) / 1.05 var(--font-display)', color: 'var(--rf-forest-deep)' }}>
                Designed for daily living.
              </h2>
              <p className="muted">Glimpses of rooms shaped with warmth and balance.</p>
            </div>
            <ReviewWall />
          </div>
        </section>

        {/* 12. Brand Partners (hidden if unconfigured) */}
        <AboutPartners config={liveConfig} />

        {/* 13. Brand motto badge */}
        <div style={{ textAlign: 'center', padding: '32px var(--page-gutter)', background: 'var(--rf-white)', borderTop: '1px solid var(--rf-line)' }}>
          <p style={{ margin: 0, color: 'var(--rf-green-800)', fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>
            {liveConfig.hindiTagline}
          </p>
        </div>

        {/* 14. 4 Action CTAs: Explore Products, Request Consultation, WhatsApp, Call Us */}
        <AboutCTA config={liveConfig} />
      </main>
    </>
  );
}
