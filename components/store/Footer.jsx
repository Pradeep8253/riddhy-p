'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './Footer.module.css';

const getGroups = (locale) => [
  {
    title: locale === 'hi' ? 'ख़रीदारी' : 'Shop',
    links: [
      [locale === 'hi' ? 'फ़र्नीचर' : 'Furniture', '/furniture'],
      [locale === 'hi' ? 'घरेलू उपकरण' : 'Home appliances', '/appliances'],
      [locale === 'hi' ? 'शादी पैकेज' : 'Marriage packages', '/packages'],
      [locale === 'hi' ? 'कमरे के अनुसार' : 'Shop by room', '/rooms/living'],
      [locale === 'hi' ? 'ऑफ़र' : 'Current offers', '/offers']
    ]
  },
  {
    title: locale === 'hi' ? 'देखभाल एवं सहायता' : 'Care & support',
    links: [
      [locale === 'hi' ? 'ऑर्डर ट्रैक करें' : 'Track your order', '/track-order'],
      [locale === 'hi' ? 'मुफ़्त होम परामर्श' : 'Free home consultation', '/consultation'],
      [locale === 'hi' ? 'वारंटी' : 'Warranty', '/warranty'],
      [locale === 'hi' ? 'डिलीवरी एवं इंस्टॉलेशन' : 'Delivery & installation', '/policies/shipping'],
      [locale === 'hi' ? 'रिटर्न एवं रिफ़ंड' : 'Returns & refunds', '/policies/returns'],
      [locale === 'hi' ? 'वारंटी नीतियां' : 'Warranty policies', '/policies/warranty'],
      [locale === 'hi' ? 'सामान्य प्रश्न' : 'FAQs', '/faq']
    ]
  },
  {
    title: locale === 'hi' ? 'रिद्धी के बारे में' : 'About Riddhy',
    links: [
      [locale === 'hi' ? 'हमारे बारे में' : 'About us', '/about'],
      [locale === 'hi' ? 'संपर्क करें' : 'Contact us', '/contact'],
      [locale === 'hi' ? 'थोक एवं व्यापार' : 'Trade & bulk', '/bulk-enquiry'],
      [locale === 'hi' ? 'गोपनीयता नीति' : 'Privacy policy', '/policies/privacy']
    ]
  }
];

const getTrustPillars = (locale) => [
  {
    icon: 'shield',
    title: locale === 'hi' ? '५ वर्ष की व्यापक वारंटी' : '5-Year Warranty',
    subtitle: locale === 'hi' ? 'संरचनात्मक सुरक्षा एवं मजबूती' : 'Comprehensive structural assurance'
  },
  {
    icon: 'truck',
    title: locale === 'hi' ? 'मुफ़्त डिलीवरी व इंस्टॉलेशन' : 'Free Delivery & Setup',
    subtitle: locale === 'hi' ? 'कुशल कारीगरों द्वारा संयोजन' : 'Careful white-glove installation'
  },
  {
    icon: 'home',
    title: locale === 'hi' ? 'मुफ़्त होम परामर्श' : 'Free Home Consultation',
    subtitle: locale === 'hi' ? 'विशेषज्ञों द्वारा सही चयन' : 'Expert guidance for your space'
  },
  {
    icon: 'award',
    title: locale === 'hi' ? '१००% शुद्ध शीशम व सागौन' : '100% Solid Timber',
    subtitle: locale === 'hi' ? 'प्रामाणिक व परिपक्व काष्ठ' : 'Seasoned sustainable hardwood'
  }
];

export default function Footer() {
  const dispatch = useDispatch();
  const locale = useSelector((state) => state.ui.locale);

  const hasPhone = isConfigured(siteConfig.contact?.phone);
  const hasEmail = isConfigured(siteConfig.contact?.email);
  const groups = getGroups(locale);
  const trustPillars = getTrustPillars(locale);

  return (
    <footer className={styles.footer}>
      {/* Background ambient lighting accents */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowRight} aria-hidden="true" />

      {/* Top Trust Ribbon */}
      <div className={styles.trustRibbon}>
        <div className={styles.trustGrid}>
          {trustPillars.map((item, idx) => (
            <div key={idx} className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <Icon name={item.icon} size={20} className={styles.trustIcon} />
              </div>
              <div className={styles.trustText}>
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className={styles.footerTop}>
        {/* Brand Column - Logo WITHOUT text */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand} aria-label="RF Riddhy home">
            <div className={styles.footerLogoBadge}>
              <Image
                src="/logo.jpeg"
                alt="RF Riddhy Furniture & Appliances"
                width={185}
                height={67}
                className={styles.footerLogoImg}
                priority={false}
              />
            </div>
          </Link>

          <p className={styles.brandMission}>
            {locale === 'hi'
              ? 'सोच-समझकर बना फ़र्नीचर। भरोसेमंद घरेलू उपकरण। घर के हर कोने में थोड़ी और आसानी और गरिमा।'
              : 'Thoughtful furniture. Dependable appliances. Enduring craft designed for real Indian living.'}
          </p>

          <p className={styles.hindiTagline}>{siteConfig.hindiTagline}</p>

          {(hasPhone || hasEmail) && (
            <div className={styles.contactChips}>
              {hasPhone && (
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                  className={styles.contactChip}
                >
                  <Icon name="phone" size={14} className={styles.contactIcon} />
                  <span>{siteConfig.contact.phone}</span>
                </a>
              )}
              {hasEmail && (
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className={styles.contactChip}
                >
                  <Icon name="mail" size={14} className={styles.contactIcon} />
                  <span>{siteConfig.contact.email}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Navigation Link Groups */}
        {groups.map((group) => (
          <div className={styles.linkGroup} key={group.title}>
            <h3 className={styles.groupHeading}>{group.title}</h3>
            <ul className={styles.groupLinks}>
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className={styles.groupLink}>
                    <span className={styles.linkBullet} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Professional Promise Card with Fancy Animated Small Vastu Image (Image Only) */}
        <div className={styles.promiseCol}>
          <div className={styles.promiseCard}>
            <div className={styles.promiseHeader}>
              <span className={styles.promiseLabel}>
                {locale === 'hi' ? 'रिद्धी का वादा' : 'A Riddhy promise'}
              </span>

              {/* Fancy Animated Small Vastu Image - Pure graphical emblem without any vastu text */}
              <div className={styles.vastuSealWrap} aria-label="Auspicious Seal">
                <div className={styles.vastuAuraRing} aria-hidden="true" />
                <div className={styles.vastuSealFrame}>
                  <Image
                    src="/vastu.jpeg"
                    alt="Auspicious Seal"
                    width={46}
                    height={46}
                    className={styles.vastuSealImg}
                  />
                  <div className={styles.vastuShimmer} aria-hidden="true" />
                </div>
              </div>
            </div>

            <strong className={styles.promiseHeadline}>
              {locale === 'hi' ? (
                <>
                  घर के लिए बना।<br />
                  लंबे समय के लिए साथ।
                </>
              ) : (
                <>
                  Made for living.<br />
                  Here for the long run.
                </>
              )}
            </strong>

            <p className={styles.promiseDesc}>
              {locale === 'hi'
                ? 'पारदर्शी डिलीवरी, सावधानीपूर्वक इंस्टॉलेशन और व्यावहारिक आफ्टरकेयर — ऑर्डर से पहले और बाद में भी।'
                : 'Clear delivery, careful installation and practical aftercare—before and after you order.'}
            </p>

            <div className={styles.promiseActions}>
              <Link href="/consultation" className={styles.ctaPrimary}>
                <span>{locale === 'hi' ? 'मुफ़्त होम परामर्श बुक करें' : 'Book home consultation'}</span>
                <Icon name="arrow" size={14} />
              </Link>
              <Link href="/contact" className={styles.ctaSecondary}>
                <span>{locale === 'hi' ? 'हमारी टीम से बात करें' : 'Talk to our team'}</span>
                <Icon name="arrowUpRight" size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* Footer Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomLeft}>
          <span className={styles.copyright}>
            {locale === 'hi'
              ? `© ${new Date().getFullYear()} RF Riddhy. सर्वाधिकार सुरक्षित।`
              : `© ${new Date().getFullYear()} RF Riddhy. All rights reserved.`}
          </span>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <span className={styles.developedBy}>
            {locale === 'hi' ? 'विकासकर्ता: ' : 'Developed by '}
            <a
              href="https://mirvex.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devLink}
            >
              Mirvex
            </a>
          </span>
          <span className={styles.prideBadge}>
            {locale === 'hi' ? 'भारत में निर्मित 🇮🇳' : 'Handcrafted in India 🇮🇳'}
          </span>
        </div>

        <div className={styles.bottomLinks}>
          <Link href="/policies/terms">{locale === 'hi' ? 'नियम व शर्तें' : 'Terms'}</Link>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <Link href="/policies/privacy">{locale === 'hi' ? 'गोपनीयता' : 'Privacy'}</Link>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <Link href="/policies/gst">{locale === 'hi' ? 'जीएसटी जानकारी' : 'GST Info'}</Link>
        </div>

        <div className={styles.toggles}>
          <button
            type="button"
            className={styles.langButton}
            onClick={() => dispatch(setLocale(locale === 'en' ? 'hi' : 'en'))}
            aria-label="Switch language"
          >
            <span className={styles.langGlobe}>🌐</span>
            <span className={locale === 'en' ? styles.langActive : ''}>EN</span>
            <span className={styles.langSlash}>/</span>
            <span className={locale === 'hi' ? styles.langActive : ''}>हिन्दी</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
