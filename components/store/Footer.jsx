'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import { tr } from '@/lib/i18n';
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

export default function Footer() {
  const dispatch = useDispatch();
  const locale = useSelector((state) => state.ui.locale);

  const hasPhone = isConfigured(siteConfig.contact.phone);
  const hasEmail = isConfigured(siteConfig.contact.email);
  const groups = getGroups(locale);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <span className={styles.mark}>RF</span>
            <span>
              <b>RIDDHY</b>
              <small>FURNITURE & HOME APPLIANCES</small>
            </span>
          </Link>
          <p>{locale === 'hi' ? 'सोच-समझकर बना फ़र्नीचर। भरोसेमंद घरेलू उपकरण। घर के हर कोने में थोड़ी और आसानी।' : 'Thoughtful furniture. Dependable appliances. A little more ease in every corner.'}</p>
          <p className={styles.hindi}>{siteConfig.hindiTagline}</p>
          {(hasPhone || hasEmail) && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#bdc7bd', display: 'grid', gap: 4 }}>
              {hasPhone && <span>Care: {siteConfig.contact.phone}</span>}
              {hasEmail && <span>Email: {siteConfig.contact.email}</span>}
            </div>
          )}
        </div>

        {groups.map((group) => (
          <div className={styles.linkGroup} key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}

        <div className={styles.promise}>
          <span className={styles.promiseLabel}>{locale === 'hi' ? 'रिद्धी का वादा' : 'A Riddhy promise'}</span>
          <strong>
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
          <p>
            {locale === 'hi'
              ? 'पारदर्शी डिलीवरी, सावधानीपूर्वक इंस्टॉलेशन और व्यावहारिक आफ्टरकेयर — ऑर्डर से पहले और बाद में भी।'
              : 'Clear delivery, careful installation and practical aftercare—before and after you order.'}
          </p>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <Link href="/consultation" style={{ color: '#edb95e', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {locale === 'hi' ? 'मुफ़्त होम परामर्श बुक करें' : 'Book home consultation'} <Icon name="arrow" size={15} />
            </Link>
            <Link href="/contact" style={{ color: '#d7ddd6', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {locale === 'hi' ? 'हमारी टीम से बात करें' : 'Talk to our team'} <Icon name="arrow" size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        RIDDHY
      </div>

      <div className={styles.footerBottom}>
        <span>{locale === 'hi' ? `© ${new Date().getFullYear()} RF Riddhy. सर्वाधिकार सुरक्षित।` : `© ${new Date().getFullYear()} RF Riddhy. All rights reserved.`}</span>
        <div className={styles.bottomLinks}>
          <Link href="/policies/terms">{locale === 'hi' ? 'नियम व शर्तें' : 'Terms'}</Link>
          <Link href="/policies/privacy">{locale === 'hi' ? 'गोपनीयता' : 'Privacy'}</Link>
          <Link href="/policies/gst">{locale === 'hi' ? 'जीएसटी जानकारी' : 'GST information'}</Link>
        </div>
        <div className={styles.toggles}>
          <button type="button" onClick={() => dispatch(setLocale(locale === 'en' ? 'hi' : 'en'))}>
            {locale === 'en' ? 'EN · हिन्दी' : 'हिन्दी · EN'}
          </button>
        </div>
      </div>
    </footer>
  );
}
