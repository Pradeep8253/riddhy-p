'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import styles from './StickyConsultationPill.module.css';

const STORAGE_DISMISS_KEY = 'rf_consultation_pill_dismissed';

export default function StickyConsultationPill() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_DISMISS_KEY) === 'true';
      setDismissed(isDismissed);
    } catch {
      setDismissed(false);
    }
  }, []);

  // Determine eligible routes
  if (dismissed) return null;
  if (!pathname) return null;

  // Never show on checkout, admin, or consultation page itself
  if (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/consultation') ||
    pathname.startsWith('/account')
  ) {
    return null;
  }

  // Eligible paths: PDP, cart, catalog listings
  const isEligible =
    pathname.startsWith('/product/') ||
    pathname === '/cart' ||
    pathname === '/furniture' ||
    pathname === '/appliances' ||
    pathname.startsWith('/furniture/') ||
    pathname.startsWith('/appliances/') ||
    pathname.startsWith('/rooms') ||
    pathname.startsWith('/offers') ||
    pathname.startsWith('/search');

  if (!isEligible) return null;

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_DISMISS_KEY, 'true');
    } catch {}
  };

  return (
    <aside className={styles.pillWrap} aria-label="Consultation assistant">
      <Link href="/consultation" className={styles.pillLink}>
        <div className={styles.iconCircle}>
          <Icon name="calendar" size={16} />
        </div>
        <div className={styles.pillText}>
          <b>Need help planning?</b>
          <span>Book free consultation</span>
        </div>
      </Link>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={handleDismiss}
        aria-label="Dismiss consultation prompt"
      >
        <Icon name="close" size={14} />
      </button>
    </aside>
  );
}
