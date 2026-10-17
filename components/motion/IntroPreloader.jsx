'use client';

import { useEffect, useState } from 'react';
import BrandMark from '@/components/ui/BrandMark';
import styles from './IntroPreloader.module.css';

export default function IntroPreloader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem('rf-intro-seen')) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      window.sessionStorage.setItem('rf-intro-seen', '1');
      return;
    }
    setVisible(true);
    const finish = window.setTimeout(() => {
      setVisible(false);
      window.sessionStorage.setItem('rf-intro-seen', '1');
    }, 750);
    return () => window.clearTimeout(finish);
  }, []);
  if (!visible) return null;
  return (
    <div className={styles.preloader} role="status" aria-label="Welcome to RF Riddhy">
      <button className={styles.skip} type="button" onClick={() => { window.sessionStorage.setItem('rf-intro-seen', '1'); setVisible(false); }}>Skip intro</button>
      <div className={styles.lockup}><BrandMark size={82} /><span className={styles.word}>RIDDHY</span><span className={styles.tagline}>FURNITURE & HOME APPLIANCES</span></div>
      <div className={styles.sweep} />
    </div>
  );
}
