'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import Icon from '@/components/ui/Icon';
import ApplianceGrid from './ApplianceGrid';
import styles from './ShopByAppliance.module.css';

export default function ShopByAppliance() {
  const locale = useSelector((state) => state.ui?.locale || 'en');

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeading
          eyebrow="Appliance precision studio"
          title="Good decisions start with clear details."
          description="Compare the things that matter—capacity, energy use, dimensions and installation—without losing the warmth of home."
          action={
            <Button href="/appliances" variant="outline">
              {locale === 'hi' ? 'सभी उपकरण देखें' : 'View all appliances'}{' '}
              <Icon name="arrowUpRight" size={15} />
            </Button>
          }
        />
        <ApplianceGrid />
        <div className={styles.note}>
          <span>
            {locale === 'hi'
              ? 'हर उत्पाद पृष्ठ पर माप और सेवा विकल्प स्पष्ट रूप से दिए गए हैं।'
              : 'Every product page puts dimensions and service options upfront.'}
          </span>
          <Link href="/policies/warranty" className={styles.link}>
            {locale === 'hi' ? 'वारंटी कवरेज समझें' : 'Understand cover'}{' '}
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
