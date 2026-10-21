'use client';

import styles from './ListingHeader.module.css';

export default function ListingHeader({
  eyebrow = 'The Riddhy collection',
  title,
  description,
  count
}) {
  return (
    <div className={styles.header}>
      <span className="kicker">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {count != null && (
        <div className={styles.count}>
          {count} pieces · sample catalogue
        </div>
      )}
    </div>
  );
}
