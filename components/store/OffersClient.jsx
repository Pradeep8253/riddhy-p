'use client';

import Image from 'next/image';
import { useSelector } from 'react-redux';
import { IMG } from '@/lib/images';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './OffersClient.module.css';

const offers = [
  {
    title: { en: 'Golden Hour deal', hi: 'गोल्डन ऑवर ऑफ़र' },
    text: {
      en: 'A warm seasonal deal across furniture and home appliances. Check item pages for eligible prices and terms.',
      hi: 'फ़र्नीचर और घरेलू उपकरणों पर विशेष मौसमी छूट। लागू मूल्य और शर्तें उत्पाद पृष्ठ पर देखें।'
    },
    image: IMG.banners.festive,
    ends: { en: '30 November 2026', hi: '30 नवंबर 2026 तक' },
    href: '/furniture'
  },
  {
    title: { en: 'Appliance studio', hi: 'घरेलू उपकरण स्टूडियो' },
    text: {
      en: 'Explore a considered range. Current product prices and any eligible promotion appear on each product page.',
      hi: 'विश्वसनीय और आधुनिक उपकरण। वर्तमान उत्पाद कीमतें और उपलब्ध ऑफ़र प्रत्येक उत्पाद पृष्ठ पर दिखाई देते हैं।'
    },
    image: IMG.banners.appliances,
    ends: { en: 'Scheduled campaign', hi: 'निर्धारित अभियान' },
    href: '/appliances'
  },
  {
    title: { en: 'Delivery & installation', hi: 'डिलीवरी एवं इंस्टॉलेशन' },
    text: {
      en: 'See delivery and installation eligibility before paying. Available service depends on product and pincode.',
      hi: 'भुगतान से पहले डिलीवरी और इंस्टॉलेशन की उपलब्धता जांचें। सेवा आपके पिनकोड पर निर्भर करती है।'
    },
    image: IMG.banners.installation,
    ends: { en: 'Service information', hi: 'सेवा जानकारी' },
    href: '/policies/shipping'
  }
];

export default function OffersClient() {
  const locale = useSelector((state) => state.ui?.locale || 'en');

  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <span className="kicker">
            {locale === 'hi' ? 'ऑफ़र, स्पष्ट शर्तों के साथ' : 'Offers, with the details up front'}
          </span>
          <h1>
            {locale === 'hi' ? (
              <>सच्चे ऑफ़र।<br /><em>स्पष्ट नियम।</em></>
            ) : (
              <>Good moments.<br /><em>Clear terms.</em></>
            )}
          </h1>
          <p>
            {locale === 'hi'
              ? 'हमारे अभियानों की वास्तविक समय-सीमा होती है। कोई झूठे काउंटडाउन या कृत्रिम स्टॉक अलर्ट नहीं — सिर्फ वास्तविक छूट और पारदर्शी शर्तें।'
              : 'Campaigns have real schedules. No rolling countdowns, no invented stock alerts—just the deals, the dates and the conditions.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={locale === 'hi' ? 'वर्तमान एवं आगामी' : 'Current and upcoming'}
            title={locale === 'hi' ? 'विशेष ऑफ़र देखें।' : 'Explore the deals.'}
            description={
              locale === 'hi'
                ? 'अभियान कार्ड हमारे मौसमी प्रचारों और पैकेज शेड्यूल को स्पष्ट शर्तों के साथ दर्शाते हैं।'
                : 'Campaign cards show our seasonal promotions and package schedules with clear terms.'
            }
          />
          <div className={styles.grid}>
            {offers.map((offer) => (
              <article className={styles.card} key={offer.title.en}>
                <div className={styles.image}>
                  <Image
                    src={offer.image}
                    alt={`${offer.title.en} campaign illustration`}
                    fill
                    sizes="(max-width:700px) 88vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className={styles.cardBody}>
                  <span>{offer.ends[locale] || offer.ends.en}</span>
                  <h2>{offer.title[locale] || offer.title.en}</h2>
                  <p>{offer.text[locale] || offer.text.en}</p>
                  <Button href={offer.href} variant="outline" size="sm">
                    {locale === 'hi' ? 'देखें' : 'Explore'} <Icon name="arrowUpRight" size={15} />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
