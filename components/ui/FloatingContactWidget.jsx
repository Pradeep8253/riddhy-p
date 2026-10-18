'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getWhatsAppUrl, getTelUrl } from '@/lib/site-config';
import styles from './FloatingContactWidget.module.css';

function WhatsAppIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function CloseIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function FloatingContactWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = useSelector((state) => state.ui?.locale || 'en');

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
            <span className={`${styles.itemIconCircle} ${styles.waIconCircle}`}>
              <WhatsAppIcon size={19} color="#ffffff" />
            </span>
            <div>
              <div>{locale === 'hi' ? 'व्हाट्सएप पर चैट करें' : 'Chat on WhatsApp'}</div>
              <small style={{ opacity: 0.85, fontSize: '11px', display: 'block' }}>
                {locale === 'hi' ? 'तुरंत जवाब' : 'Instant response'}
              </small>
            </div>
          </a>

          <a
            href={telUrl}
            className={`${styles.menuItem} ${styles.callItem}`}
            onClick={() => setOpen(false)}
          >
            <span className={`${styles.itemIconCircle} ${styles.callIconCircle}`}>
              <PhoneIcon size={18} color="#ffffff" />
            </span>
            <div>
              <div>{locale === 'hi' ? 'शोरूम केयर को कॉल करें' : 'Call Showroom Care'}</div>
              <small style={{ opacity: 0.85, fontSize: '11px', display: 'block' }}>
                {locale === 'hi' ? 'सीधी टेलीफ़ोन सहायता' : 'Direct telephone assistance'}
              </small>
            </div>
          </a>
        </div>
      )}

      <button
        type="button"
        className={styles.mainToggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? (locale === 'hi' ? 'संपर्क मेनू बंद करें' : 'Close contact menu') : (locale === 'hi' ? 'चैट एवं कॉल विकल्प खोलें' : 'Open chat and call options')}
      >
        <span
          className={styles.iconCircle}
          style={{ background: open ? 'var(--rf-charcoal-900)' : '#25d366' }}
        >
          {open ? <CloseIcon size={15} color="#ffffff" /> : <WhatsAppIcon size={18} color="#ffffff" />}
        </span>
        <span>{open ? (locale === 'hi' ? 'बंद करें' : 'Close') : (locale === 'hi' ? 'सहायता एवं चैट' : 'Chat & Call')}</span>
      </button>
    </aside>
  );
}
