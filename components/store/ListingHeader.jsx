'use client';

import { useSelector } from 'react-redux';
import {
  getLocalizedCategoryName,
  getLocalizedEyebrow,
  getLocalizedCategoryDescription
} from '@/lib/translate-backend';
import styles from './ListingHeader.module.css';

export default function ListingHeader({
  eyebrow = 'The Riddhy collection',
  title,
  description,
  count
}) {
  const locale = useSelector((state) => state.ui?.locale || 'en');

  const localizedEyebrow = getLocalizedEyebrow(eyebrow, locale);
  const localizedTitle = getLocalizedCategoryName(title, locale);
  const localizedDescription = getLocalizedCategoryDescription(title, description, locale);

  return (
    <div className={styles.header}>
      <span className="kicker">{localizedEyebrow}</span>
      <h1>{localizedTitle}</h1>
      <p>{localizedDescription}</p>
      {count != null && (
        <div className={styles.count}>
          {locale === 'hi'
            ? `${count} उत्पाद · सैंपल कैटलॉग`
            : `${count} pieces · sample catalogue`}
        </div>
      )}
    </div>
  );
}
