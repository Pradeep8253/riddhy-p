'use client';

import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './Footer.module.css';

const groups = [
  {
    title: 'Shop',
    links: [
      ['Furniture', '/furniture'],
      ['Home appliances', '/appliances'],
      ['Marriage packages', '/packages'],
      ['Shop by room', '/rooms/living']
    ]
  },
  {
    title: 'Care & support',
    links: [
      ['Track your order', '/track-order'],
      ['Free home consultation', '/consultation'],
      ['Warranty', '/warranty'],
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
      ['Trade & bulk', '/bulk-enquiry'],
      ['Privacy policy', '/policies/privacy']
    ]
  }
];

const trustPillars = [
  {
    icon: 'shield',
    title: '5-Year Warranty',
    subtitle: 'Comprehensive structural assurance'
  },
  {
    icon: 'truck',
    title: 'Free Delivery & Setup',
    subtitle: 'Careful white-glove installation'
  },
  {
    icon: 'home',
    title: 'Free Home Consultation',
    subtitle: 'Expert guidance for your space'
  },
  {
    icon: 'award',
    title: '100% Solid Timber',
    subtitle: 'Seasoned sustainable hardwood'
  }
];

export default function Footer() {
  const hasPhone = isConfigured(siteConfig.contact?.phone);
  const hasEmail = isConfigured(siteConfig.contact?.email);

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
            Thoughtful furniture. Dependable appliances. Enduring craft designed for real Indian living.
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
                A Riddhy promise
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
              Made for living.<br />
              Here for the long run.
            </strong>

            <p className={styles.promiseDesc}>
              Clear delivery, careful installation and practical aftercare—before and after you order.
            </p>

            <div className={styles.promiseActions}>
              <Link href="/consultation" className={styles.ctaPrimary}>
                <span>Book home consultation</span>
                <Icon name="arrow" size={14} />
              </Link>
              <Link href="/contact" className={styles.ctaSecondary}>
                <span>Talk to our team</span>
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
            {`© ${new Date().getFullYear()} RF Riddhy. All rights reserved.`}
          </span>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <span className={styles.developedBy}>
            Developed by{' '}
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
            Handcrafted in India 🇮🇳
          </span>
        </div>

        <div className={styles.bottomLinks}>
          <Link href="/policies/terms">Terms</Link>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <Link href="/policies/privacy">Privacy</Link>
          <span className={styles.bottomSep} aria-hidden="true">•</span>
          <Link href="/policies/gst">GST Info</Link>
        </div>
      </div>
    </footer>
  );
}
