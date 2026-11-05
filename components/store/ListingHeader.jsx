'use client';

import { useSelector } from 'react-redux';
import { getLocalizedSectionHeader, getLocalizedEyebrow } from '@/lib/translate-backend';

import styles from './ListingHeader.module.css';

export default function ListingHeader({
  eyebrow = 'The Riddhy Collection',
  title,
  description,
  count
}) {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <span className={styles.eyebrowTag}>{getLocalizedEyebrow(eyebrow, locale)}</span>
          <h1 className={styles.title}>{getLocalizedSectionHeader(title, locale)}</h1>
          {description && <p className={styles.description}>{getLocalizedSectionHeader(description, locale)}</p>}

          <div className={styles.metaRow}>
            {count != null && (
              <span className={styles.countBadge}>
                {count} Handcrafted Designs Available
              </span>
            )}
            <div className={styles.perks}>
              <span>{locale === 'hi' ? '✓ 10-वर्ष फ़्रेम वारंटी' : '✓ 10-Year Frame Warranty'}</span>
              <span className={styles.perkDot}>·</span>
              <span>{locale === 'hi' ? '✓ निःशुल्क वाइट-ग्लव असेंबली' : '✓ Free White-Glove Assembly'}</span>
              <span className={styles.perkDot}>·</span>
              <span>{locale === 'hi' ? '✓ यूपी में घर तक डिलीवरी' : '✓ Doorstep Delivery in UP'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
