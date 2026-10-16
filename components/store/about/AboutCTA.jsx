import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured, getTelUrl, getWhatsAppUrl } from '@/lib/site-config';
import styles from './AboutSections.module.css';

export default function AboutCTA({ config = siteConfig } = {}) {
  const phone = config?.contact?.phone || siteConfig.contact.phone || '+91 98765 43210';
  const whatsapp = config?.contact?.whatsapp || siteConfig.contact.whatsapp || '919876543210';
  const telUrl = `tel:${phone.replace(/\s+/g, '')}`;
  const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hello RF Riddhy, I would like to know more about your furniture, marriage packages, and appliances.'
  )}`;

  return (
    <section className={styles.ctaBand}>
      <div className="container">
        <div className={styles.ctaContent}>
          <span className="kicker" style={{ color: 'var(--rf-gold-400)' }}>
            Let’s start with your space
          </span>
          <h2>
            Find a piece that feels <em>right.</em>
          </h2>
          <p>
            Whether you are furnishing a new apartment, planning a marriage setup, or upgrading your everyday
            appliances, our team is ready to assist you.
          </p>

          <div className={styles.ctaButtonsGroup}>
            <Link href="/furniture" className={styles.ctaPrimary}>
              Explore Products <Icon name="arrow" size={15} />
            </Link>
            <Link href="/consultation" className={styles.ctaGold}>
              Request a Consultation <Icon name="calendar" size={15} />
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaWhatsApp}
            >
              <Icon name="whatsapp" size={16} /> Chat on WhatsApp
            </a>
            <a href={telUrl} className={styles.ctaCall}>
              <Icon name="phone" size={15} /> Call Us ({phone})
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
