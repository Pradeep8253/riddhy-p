'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getWhatsAppUrl, getTelUrl } from '@/lib/site-config';
import styles from './FloatingContactWidget.module.css';

export default function FloatingContactWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show inside admin console
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Predefined contextual WhatsApp messages
  let waMessage = 'Hello RF Riddhy, I would like to know more about your products.';

  if (pathname?.includes('package')) {
    waMessage = 'Hello RF Riddhy, I am interested in your marriage packages. Please share the details.';
  } else if (pathname?.includes('bulk')) {
    waMessage = 'Hello RF Riddhy, I would like to inquire about bulk purchasing.';
  } else if (pathname?.includes('contact')) {
    waMessage = 'Hello RF Riddhy, I need help sourcing a specific product or consultation.';
  } else if (pathname?.includes('warranty')) {
    waMessage = 'Hello RF Riddhy, I would like to inquire about product warranty registration & coverage.';
  } else if (pathname?.includes('appliance')) {
    waMessage = 'Hello RF Riddhy, I would like more information on your home appliances and warranty.';
  } else if (pathname?.includes('furniture') || pathname?.includes('room')) {
    waMessage = 'Hello RF Riddhy, I am interested in your handcrafted furniture collection.';
  }

  const waUrl = getWhatsAppUrl(waMessage);
  const telUrl = getTelUrl();

  return (
    <aside className={styles.widget} aria-label="Quick contact channels">
      {open && (
        <div className={styles.menu}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.menuItem} ${styles.waItem}`}
            onClick={() => setOpen(false)}
          >
            <span>💬</span>
            <div>
              <div>Chat on WhatsApp</div>
              <small style={{ opacity: 0.8, fontSize: '10px' }}>Instant response</small>
            </div>
          </a>

          <a
            href={telUrl}
            className={`${styles.menuItem} ${styles.callItem}`}
            onClick={() => setOpen(false)}
          >
            <span>📞</span>
            <div>
              <div>Call Showroom Care</div>
              <small style={{ opacity: 0.8, fontSize: '10px' }}>Direct telephone assistance</small>
            </div>
          </a>
        </div>
      )}

      <button
        type="button"
        className={styles.mainToggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle contact options"
      >
        <span className={styles.iconCircle}>💬</span>
        <span>{open ? 'Close' : 'Chat & Call'}</span>
      </button>
    </aside>
  );
}
