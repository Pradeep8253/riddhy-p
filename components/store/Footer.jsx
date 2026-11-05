'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './Footer.module.css';

const groups = [
  {
    title: 'Shop',
    links: [
      ['Furniture', '/furniture'],
      ['Home appliances', '/appliances'],
      ['Our packages', '/packages'],
      ['Shop by room', '/rooms/living']
    ]
  },
  {
    title: 'Care & support',
    links: [
      ['Track your order', '/track-order'],
      ['Prayagraj Store & Hub', '/contact'],
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
      ['About ', '/about'],
      ['Contact us', '/contact'],
      ['Trade & bulk', '/bulk-enquiry'],
      ['Privacy policy', '/policies/privacy']
    ]
  }
];


const trustPillarsHi = [
  { icon: 'shield', title: '5-वर्षीय वारंटी', subtitle: 'व्यापक संरचनात्मक आश्वासन' },
  { icon: 'truck', title: 'मुफ़्त डिलीवरी व सेटअप', subtitle: 'सावधानीपूर्वक इंस्टॉलेशन' },
  { icon: 'mapPin', title: 'प्रयागराज स्थानीय स्टोर', subtitle: 'स्थानीय डिलीवरी एवं शोरूम सहायता' },
  { icon: 'award', title: '100% सॉलिड टिम्बर', subtitle: 'टिकाऊ प्राकृतिक लकड़ी' }
];

const groupsHi = [
  {
    title: 'ख़रीदारी',
    links: [
      ['फर्नीचर', '/furniture'],
      ['घरेलू उपकरण', '/appliances'],
      ['विवाह पैकेज', '/packages'],
      ['कमरे के अनुसार', '/rooms/living']
    ]
  },
  {
    title: 'सहायता व सेवा',
    links: [
      ['ऑर्डर ट्रैक करें', '/track-order'],
      ['प्रयागराज स्टोर व हब', '/contact'],
      ['वारंटी विवरण', '/warranty'],
      ['डिलीवरी एवं स्थापना', '/policies/shipping'],
      ['वापसी व धनवापसी', '/policies/returns'],
      ['वारंटी नीतियां', '/policies/warranty'],
      ['अक्सर पूछे जाने वाले प्रश्न', '/faq']
    ]
  },
  {
    title: 'रिद्धि के बारे में',
    links: [
      ['हमारे बारे में', '/about'],
      ['संपर्क करें', '/contact'],
      ['थोक एवं व्यापार पूछताछ', '/bulk-enquiry'],
      ['गोपनीयता नीति', '/policies/privacy']
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
    icon: 'mapPin',
    title: 'Prayagraj Local Store',
    subtitle: 'Direct local delivery & showroom support'
  },
  {
    icon: 'award',
    title: '100% Solid Timber',
    subtitle: 'Seasoned sustainable hardwood'
  }
];

export default function Footer({ config }) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const activeConfig = config || siteConfig;
  const hasPhone = isConfigured(activeConfig.contact?.phone);
  const hasEmail = isConfigured(activeConfig.contact?.email);
  const phone = activeConfig.contact?.phone || '+91 88402 45188';
  const email = activeConfig.contact?.email || 'riddhyfurnitureshomeappliances@gmail.com';
  const city = activeConfig.showroom?.city || 'Prayagraj';
  const whatsappDigits = (activeConfig.contact?.whatsapp || activeConfig.contact?.phone || '918840245188').replace(/[^0-9]/g, '');
  const hindiTagline = activeConfig.hindiTagline || siteConfig.hindiTagline;

  const instagramUrl = activeConfig.social?.instagram || siteConfig.social?.instagram || 'https://www.instagram.com/riddhyfurnitures';
  const facebookUrl = activeConfig.social?.facebook || siteConfig.social?.facebook || 'https://www.facebook.com/riddhyfurnitures';
  const youtubeUrl = activeConfig.social?.youtube || siteConfig.social?.youtube || 'https://www.youtube.com/@riddhyfurnitures';
  const mapUrl = activeConfig.showroom?.mapUrl || siteConfig.showroom?.mapUrl || 'https://www.google.com/maps/search/?api=1&query=Riddhy+Furnitures+Mansoorabad+Prayagraj+Uttar+Pradesh+229411';

  return (
    <footer className={styles.footer}>
      {/* Background ambient lighting accents */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowRight} aria-hidden="true" />

      {/* Top Trust Ribbon */}
      <div className={styles.trustRibbon}>
        <div className={styles.trustGrid}>
          {(locale === 'hi' ? trustPillarsHi : trustPillars).map((item, idx) => (
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
            Premium furniture and appliances for retail, wholesale, marriage packages, and custom orders — crafted with lasting quality for real Indian living. From everyday essentials to fancy, on-demand designs, we bring trusted craftsmanship to every home and business.
          </p>

          <p className={styles.hindiTagline}>{hindiTagline}</p>
        </div>

        {/* Navigation Link Groups */}
        {(locale === 'hi' ? groupsHi : groups).map((group) => (
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
              <span className={styles.promiseLabel}>{locale === 'hi' ? 'रिद्धि का वादा' : 'A Riddhy promise'}</span>

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
              {locale === 'hi' ? <>परिवार के लिए निर्मित।<br />लंबे समय के भरोसे के साथ।</> : <>Made for living.<br />Here for the long run.</>}
            </strong>

            <p className={styles.promiseDesc}>
              Clear delivery, careful installation and practical aftercare—before and after you order.
            </p>

            <div className={styles.promiseActions}>
              <Link href="/contact" className={styles.ctaPrimary}>
                <span>{locale === 'hi' ? `${city === 'Prayagraj' ? 'प्रयागराज' : city} स्टोर पर जाएँ` : `Visit ${city} Store`}</span>
                <Icon name="arrow" size={14} />
              </Link>
              <a
                href={`https://wa.me/${whatsappDigits}?text=Hello%20RF%20Riddhy%2C%20I%20want%20to%20inquire%20about%20your%20${encodeURIComponent(city)}%20store%20collection`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                <span>{locale === 'hi' ? 'व्हाट्सएप पर चैट करें' : 'Chat on WhatsApp'}</span>
                <Icon name="arrowUpRight" size={13} />
              </a>
            </div>
            {/* Social Icons & Store Direction directly below Prayagraj store option */}
            <div className={styles.promiseSocialWrap}>
              <span className={styles.promiseSocialLabel}>
                {locale === 'hi' ? 'सोशल मीडिया व स्टोर' : 'Connect & Find Store'}
              </span>
              <div className={styles.promiseSocialIcons}>
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Instagram"
                    title="Follow us on Instagram"
                  >
                    <Icon name="instagram" size={16} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Facebook"
                    title="Follow us on Facebook"
                  >
                    <Icon name="facebook" size={16} />
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="YouTube"
                    title="Watch on YouTube"
                  >
                    <Icon name="youtube" size={16} />
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Prayagraj Store on Google Maps"
                    title="Visit Prayagraj Store on Google Maps"
                  >
                    <Icon name="mapPin" size={16} />
                  </a>
                )}
                {whatsappDigits && (
                  <a
                    href={`https://wa.me/${whatsappDigits}?text=Hello%20RF%20Riddhy%2C%20I%20want%20to%20inquire%20about%20your%20Prayagraj%20store`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="WhatsApp"
                    title="Chat on WhatsApp"
                  >
                    <Icon name="whatsapp" size={16} />
                  </a>
                )}
              </div>
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
