'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setLiteMode, setLocale } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import { tr } from '@/lib/i18n';
import styles from './Footer.module.css';

const groups = [
  {
    title: 'Shop',
    links: [
      ['Furniture', '/furniture'],
      ['Home appliances', '/appliances'],
      ['Marriage packages', '/packages'],
      ['Shop by room', '/rooms/living'],
      ['Current offers', '/offers']
    ]
  },
  {
    title: 'Care & support',
    links: [
      ['Free home consultation', '/consultation'],
      ['Warranty & certificate', '/warranty'],
      ['Delivery & installation', '/policies/shipping'],
      ['Returns & refunds', '/policies/returns'],
      ['Warranty policies', '/policies/warranty'],
      ['FAQs', '/faq']
    ]
  },
  {
    title: 'About Riddhy',
    links: [
      ['About us', '/about'],
      ['Contact us', '/contact'],
      ['Bulk & trade', '/bulk-enquiry'],
      ['Privacy policy', '/policies/privacy']
    ]
  }
];

export default function Footer() {
  const dispatch = useDispatch();
  const liteMode = useSelector((state) => state.ui.liteMode);
  const locale = useSelector((state) => state.ui.locale);

  const toggleLite = () => {
    const next = !liteMode;
    dispatch(setLiteMode(next));
    window.localStorage.setItem('rf-lite-mode', next ? '1' : '0');
    window.dispatchEvent(new CustomEvent('rf-lite-mode', { detail: next }));
  };

  const hasPhone = isConfigured(siteConfig.contact.phone);
  const hasEmail = isConfigured(siteConfig.contact.email);

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
          <p>Thoughtful furniture. Dependable appliances. A little more ease in every corner.</p>
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
          <span className={styles.promiseLabel}>A Riddhy promise</span>
          <strong>
            Made for living.<br />
            Here for the long run.
          </strong>
          <p>Clear delivery, careful installation and practical aftercare—before and after you order.</p>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <Link href="/consultation" style={{ color: '#edb95e', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Book home consultation <Icon name="arrow" size={15} />
            </Link>
            <Link href="/contact" style={{ color: '#d7ddd6', fontSize: 11 }}>
              Talk to our team →
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        RIDDHY
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} RF Riddhy. All rights reserved.</span>
        <div className={styles.bottomLinks}>
          <Link href="/policies/terms">Terms</Link>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/gst">GST information</Link>
        </div>
        <div className={styles.toggles}>
          <button type="button" onClick={() => dispatch(setLocale(locale === 'en' ? 'hi' : 'en'))}>
            {locale === 'en' ? 'EN · हिन्दी' : 'हिन्दी · EN'}
          </button>
          <button type="button" aria-pressed={liteMode} onClick={toggleLite}>
            {liteMode ? tr(locale, 'liteOn') : tr(locale, 'reduceMotion')}
          </button>
        </div>
      </div>
    </footer>
  );
}
