'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import Icon from '@/components/ui/Icon';
import styles from './WarrantyPromise.module.css';

const pointsEn = [
  ['01', 'Made legible', 'Manufacturer, seller and optional extended cover are shown separately.'],
  ['02', 'Starts at the right moment', 'Delivery or installation start rules are recorded with the product policy.'],
  ['03', 'Easy to find later', 'Registration, service requests and remaining days live together in your account.']
];

const pointsHi = [
  ['01', 'स्पष्ट और पारदर्शी', 'निर्माता, विक्रेता और अतिरिक्त कवरेज अलग-अलग स्पष्ट रूप से दिखाए जाते हैं।'],
  ['02', 'सही समय पर शुरुआत', 'डिलीवरी या इंस्टॉलेशन से वारंटी शुरू होने का नियम स्पष्ट रूप से दर्ज रहता है।'],
  ['03', 'खाते में आसानी से उपलब्ध', 'रजिस्ट्रेशन, सर्विस क्लेम और शेष दिनों की जानकारी आपके खाते में हमेशा उपलब्ध रहती है।']
];

export default function WarrantyPromise() {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const points = locale === 'hi' ? pointsHi : pointsEn;

  return (
    <section className={styles.section}>
      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 240 240" role="img" aria-label="Illustrative 730 day warranty ring">
          <circle className={styles.track} cx="120" cy="120" r="105" />
          <circle className={styles.progress} cx="120" cy="120" r="105" />
        </svg>
        <div className={styles.ringText}>
          <span>{locale === 'hi' ? 'योग्य फ़र्नीचर' : 'ELIGIBLE FURNITURE'}</span>
          <b>730</b>
          <small>{locale === 'hi' ? 'दिन, सांकेतिक' : 'days, illustrated'}</small>
        </div>
        <span className={styles.spark}>✦</span>
      </div>
      <div className={styles.copy}>
        <span className="kicker">
          {locale === 'hi' ? 'बिना किसी छिपी शर्त के पारदर्शी वारंटी' : 'Warranty, without the fine-print hunt'}
        </span>
        <h2>
          {locale === 'hi' ? (
            <>
              देखभाल जो हमेशा<br />
              <em>उत्पाद के साथ रहे।</em>
            </>
          ) : (
            <>
              Care that stays<br />
              <em>with the product.</em>
            </>
          )}
        </h2>
        <p>
          {locale === 'hi'
            ? 'हर उत्पाद पृष्ठ पर उसका विशिष्ट कवरेज और नियम दिखाया गया है। यह चक्र केवल एक उदाहरण है।'
            : 'Every product page shows its own coverage and start rule. The ring is an illustration—not a promise for every item.'}
        </p>
        <ul>
          {points.map(([num, title, body]) => (
            <li key={num}>
              <span>{num}</span>
              <div>
                <b>{title}</b>
                <small>{body}</small>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/policies/warranty" className={styles.link}>
          {locale === 'hi' ? 'वारंटी नियम समझें' : 'Read how warranty works'} <Icon name="arrow" size={17} />
        </Link>
      </div>
    </section>
  );
}
