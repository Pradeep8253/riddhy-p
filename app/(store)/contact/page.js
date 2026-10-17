import Link from 'next/link';
import InquiryForm from '@/components/commerce/InquiryForm';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import { getLiveSiteConfig } from '@/lib/server-config';
import { IMG } from '@/lib/images';
import styles from './content.module.css';

export async function generateMetadata() {
  const liveConfig = await getLiveSiteConfig();
  const url = `${liveConfig.siteUrl}/contact`;
  const title = 'Contact RF Riddhy — Customer Care & Showroom';
  const description =
    'Connect with the RF Riddhy team for product advice, order status, delivery, installation, warranty, and showroom visits.';

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

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const topicParam = params?.topic || 'other';

  const liveConfig = await getLiveSiteConfig();
  const phone = (liveConfig.contact.phone || '').trim();
  const telUrl = phone ? `tel:${phone.replace(/\s+/g, '')}` : '';
  const waNumber = (liveConfig.contact.whatsapp || '').replace(/\D/g, '');
  const whatsappUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Hello! I would like to enquire about RF Riddhy products.')}`
    : '';

  const hasPhone = isConfigured(liveConfig.contact.phone);
  const hasWhatsapp = isConfigured(liveConfig.contact.whatsapp);
  const hasEmail = isConfigured(liveConfig.contact.email);
  const hasShowroom = isConfigured(liveConfig.showroom.addressLine1);
  const hasHours = isConfigured(liveConfig.contact.hours);
  const hasResponseTime = isConfigured(liveConfig.contact.responseTime);

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'RF Riddhy Customer Care & Support',
    url: `${siteConfig.siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.brandName,
      url: siteConfig.siteUrl,
      ...(hasPhone
        ? {
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: siteConfig.contact.phone,
              contactType: 'customer support',
              areaServed: 'IN',
              availableLanguage: ['en', 'hi']
            }
          }
        : {})
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema).replace(/</g, '\\u003c') }}
      />

      <main className="container" style={{ paddingBlock: 'clamp(48px, 6vw, 90px)' }}>
        {/* Intro */}
        <div className={styles.introHeader}>
          <span className="kicker">We’re here to help</span>
          <h1>
            Good conversations<br />
            <em>make good homes.</em>
          </h1>
          <p>
            Have a question about a product, delivery timeline, installation feasibility, or warranty aftercare?
            Reach out through your preferred channel or send us a message below.
          </p>

          {hasResponseTime && (
            <div className={styles.responseNotice}>
              <Icon name="clock" size={16} />
              <span>We usually reply within {liveConfig.contact.responseTime}.</span>
            </div>
          )}
        </div>

        {/* Channels Grid (Cards render ONLY when configured) */}
        {(hasPhone || hasWhatsapp || hasEmail || hasShowroom) && (
          <div className={styles.channelsGrid}>
            {hasPhone && (
              <a href={telUrl} className={styles.channelCard}>
                <div className={styles.channelIcon}>
                  <Icon name="phone" size={22} />
                </div>
                <span>Phone support</span>
                <b>{liveConfig.contact.phone}</b>
                <small>Direct voice assistance</small>
              </a>
            )}

            {hasWhatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelCard}
              >
                <div className={`${styles.channelIcon} ${styles.waIcon}`}>
                  <Icon name="whatsapp" size={22} />
                </div>
                <span>WhatsApp chat</span>
                <b>Connect on WhatsApp</b>
                <small>Quick responses & photos</small>
              </a>
            )}

            {hasEmail && (
              <a href={`mailto:${liveConfig.contact.email}`} className={styles.channelCard}>
                <div className={styles.channelIcon}>
                  <Icon name="mail" size={22} />
                </div>
                <span>Email care</span>
                <b>{liveConfig.contact.email}</b>
                <small>Detailed inquiries & orders</small>
              </a>
            )}

            {hasShowroom && (
              <div className={styles.channelCard}>
                <div className={styles.channelIcon}>
                  <Icon name="mapPin" size={22} />
                </div>
                <span>Experience store</span>
                <b>{liveConfig.showroom.city || 'Showroom'}</b>
                <small>{liveConfig.showroom.addressLine1}</small>
                {isConfigured(liveConfig.showroom.mapUrl) && (
                  <a
                    href={liveConfig.showroom.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dirLink}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Get directions <Icon name="arrow" size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Layout: Form + Quick Help Links */}
        <div className={styles.formSectionGrid}>
          {/* Form */}
          <div className={styles.formCard}>
            <div className={styles.formHead}>
              <span className="kicker">Direct message</span>
              <h2>Send an enquiry</h2>
              <p>Select your topic so we can direct your message to the right specialist.</p>
            </div>
            <InquiryForm kind="contact" initialTopic={topicParam} />
          </div>

          {/* Quick Help & Consultation Cross-link */}
          <div className={styles.sideHelpCol}>
            {/* Cross link to consultation */}
            <div className={styles.consultationPromo}>
              <span className="kicker" style={{ color: 'var(--rf-gold-600)' }}>Free service</span>
              <h3>Need guided planning?</h3>
              <p>
                If you are planning an entire room or need advice on appliance capacities and electrical clearances,
                book a dedicated 20-minute consultation.
              </p>
              <Link href="/consultation" className={styles.consultationBtn}>
                Book Home Consultation <Icon name="arrow" size={16} />
              </Link>
            </div>

            {/* Instant help shortcuts */}
            <div className={styles.instantHelpCard}>
              <h4>Instant help resources</h4>
              <ul className={styles.helpLinks}>
                <li>
                  <Link href="/account">
                    <Icon name="user" size={16} />
                    <span>Track order or request warranty claim in Account</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/shipping">
                    <Icon name="truck" size={16} />
                    <span>Delivery areas, timeline and fees guide</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/warranty">
                    <Icon name="shield" size={16} />
                    <span>Warranty policies & start date rules</span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <Icon name="info" size={16} />
                    <span>Browse frequently asked questions</span>
                  </Link>
                </li>
                <li>
                  <Link href="/bulk-enquiry">
                    <Icon name="check" size={16} />
                    <span>Bulk & trade quotes for organisations</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Operating hours if configured */}
            {hasHours && (
              <div className={styles.hoursCard}>
                <b>Support & Store Hours</b>
                <p>{liveConfig.contact.hours}</p>
                {isConfigured(liveConfig.contact.holidaysNotice) && (
                  <small>{liveConfig.contact.holidaysNotice}</small>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
