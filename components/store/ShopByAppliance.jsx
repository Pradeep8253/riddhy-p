'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import Icon from '@/components/ui/Icon';
import ApplianceGrid from './ApplianceGrid';
import styles from './ShopByAppliance.module.css';

export default function ShopByAppliance({ categories, className = '', style }) {
  return (
    <section className={`${styles.section} ${className}`} style={style}>
      <div className="container">
        <SectionHeading
          eyebrow="Appliance precision studio"
          title="Good decisions start with clear details."
          description="Compare the things that matter—capacity, energy use, dimensions and installation—without losing the warmth of home."
          action={
            <Button href="/appliances" variant="outline">
              View all appliances{' '}
              <Icon name="arrowUpRight" size={15} />
            </Button>
          }
        />
        <ApplianceGrid categories={categories} />
        <div className={styles.note}>
          <span>
            Every product page puts dimensions and service options upfront.
          </span>
          <Link href="/policies/warranty" className={styles.link}>
            Understand cover{' '}
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
