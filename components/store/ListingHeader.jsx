'use client';

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
          <span className={styles.eyebrowTag}>{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.metaRow}>
            {count != null && (
              <span className={styles.countBadge}>
                {count} Handcrafted Designs Available
              </span>
            )}
            <div className={styles.perks}>
              <span>✓ 10-Year Frame Warranty</span>
              <span className={styles.perkDot}>·</span>
              <span>✓ Free White-Glove Assembly</span>
              <span className={styles.perkDot}>·</span>
              <span>✓ Doorstep Delivery in UP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
