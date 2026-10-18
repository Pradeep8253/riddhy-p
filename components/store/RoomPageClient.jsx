'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import ProductGrid from '@/components/ui/ProductGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './RoomPageClient.module.css';

const titles = {
  living: { en: 'Living room', hi: 'लिविंग रूम' },
  bedroom: { en: 'Bedroom', hi: 'बेडरूम' },
  dining: { en: 'Dining room', hi: 'डाइनिंग रूम' },
  study: { en: 'Study & work', hi: 'स्टडी एवं वर्कस्पेस' },
  kitchen: { en: 'Kitchen & utility', hi: 'किचन एवं यूटिलिटी' }
};

export default function RoomPageClient({ room, image, products }) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const roomTitle = titles[room]?.[locale] || titles[room]?.en || 'Room';

  return (
    <>
      <section className={styles.hero}>
        <Image src={image.src} alt={image.alt} fill priority sizes="100vw" unoptimized />
        <div className={styles.scrim} />
        <div className="container">
          <span className="kicker">
            {locale === 'hi' ? 'कमरा संपादन · RF रिद्धि' : 'Room edit · RF Riddhy'}
          </span>
          <h1>
            {roomTitle}<br />
            <em>{locale === 'hi' ? 'संतुलन एवं सौंदर्य में।' : 'in balance.'}</em>
          </h1>
          <p>
            {locale === 'hi'
              ? 'अपनी जीवनशैली के अनुसार शुरुआत करें। ऐसे उत्पाद चुनें जो आपके कमरे को आरामदायक और संपूर्ण बनाएं।'
              : 'Start with the way you live. Layer in the pieces that make the room feel right.'}
          </p>
          <Button href="/furniture" variant="gold">
            {locale === 'hi' ? 'फ़र्नीचर देखें' : 'Explore furniture'} <Icon name="arrowUpRight" size={15} />
          </Button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={locale === 'hi' ? 'इस कमरे के उत्पाद' : 'Shop this room'}
            title={locale === 'hi' ? 'सुविचारित शुरुआत।' : 'A thoughtful starting point.'}
            description={
              locale === 'hi'
                ? 'आपके घर के लिए प्रेरणादायक उत्पाद। प्रत्येक उत्पाद पर सटीक माप और पिनकोड सर्विस देखें।'
                : 'Demo assortment for inspiration. Check exact dimensions and pincode service options on each product.'
            }
          />
          <ProductGrid products={products} />
        </div>
      </section>

      <div className={styles.bottom}>
        <Link href="/appliances">
          {locale === 'hi'
            ? 'इस कमरे के लिए उपयुक्त घरेलू उपकरण देखें'
            : 'Explore appliances for this room'} <Icon name="arrow" size={15} />
        </Link>
      </div>
    </>
  );
}
