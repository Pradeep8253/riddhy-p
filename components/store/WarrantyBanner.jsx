'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import styles from './WarrantyBanner.module.css';

export default function WarrantyBanner() {
  const [loading, setLoading] = useState(true);
  const [activeWarranty, setActiveWarranty] = useState(null);
  const [cmsConfig, setCmsConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Try to fetch logged-in customer warranties
      try {
        const res = await fetch('/api/me/warranties', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          // Find earliest active expiring warranty
          const active = items
            .filter((w) => (w.daysRemaining ?? 0) > 0)
            .sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0))[0];

          if (isMounted && active) {
            setActiveWarranty(active);
          }
        }
      } catch {
        // Fall back silently for guests
      }

      // 2. Fetch CMS banner configuration if available
      try {
        const cmsRes = await fetch('/api/banners?zone=warranty-strip', { cache: 'no-store' });
        if (cmsRes.ok) {
          const cmsData = await cmsRes.json();
          const banners = Array.isArray(cmsData.data) ? cmsData.data : Array.isArray(cmsData) ? cmsData : [];
          const stripBanner = banners.find((b) => b.active !== false);
          if (isMounted && stripBanner) {
            setCmsConfig(stripBanner);
          }
        }
      } catch {
        // Fall back silently
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Default copy
  const defaultText = 'Bought from us? Your warranty starts the day you buy.';
  const displayText = cmsConfig?.title || defaultText;

  return (
    <aside className={styles.strip} aria-label="Warranty Status & Assurance Strip">
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.iconWrap}>
            <ShieldCheck size={18} />
          </span>

          {loading ? (
            <div className={styles.skeleton} />
          ) : activeWarranty ? (
            <span className={styles.message}>
              Your <strong>{activeWarranty.productName || activeWarranty.sku}</strong>:{' '}
              <span className={styles.liveHighlight}>
                {activeWarranty.daysRemaining} days of warranty left
              </span>
            </span>
          ) : (
            <span className={styles.message}>
              <strong>{displayText}</strong> Transparent coverage with priority care.
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <Link href="/warranty" className={styles.btnPrimary}>
            <span>Check my warranty</span>
            <ArrowRight size={13} />
          </Link>

          <Link href="/warranty?tab=register" className={styles.btnSecondary}>
            <span>Register a purchase</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
