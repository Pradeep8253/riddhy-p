'use client';

import { useSelector } from 'react-redux';
import { getLocalizedSectionHeader } from '@/lib/translate-backend';
import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, description, action, align = 'left', tone = 'default' }) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const locEyebrow = typeof eyebrow === 'string' ? getLocalizedSectionHeader(eyebrow, locale) : eyebrow;
  const locTitle = typeof title === 'string' ? getLocalizedSectionHeader(title, locale) : title;
  const locDescription = typeof description === 'string' ? getLocalizedSectionHeader(description, locale) : description;

  return (
    <div className={`${styles.heading} ${styles[align]} ${styles[tone]}`}>
      <div>
        {locEyebrow && <span className="kicker">{locEyebrow}</span>}
        {locTitle && <h2>{locTitle}</h2>}
        {locDescription && <p>{locDescription}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
