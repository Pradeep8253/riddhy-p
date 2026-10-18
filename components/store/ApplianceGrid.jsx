'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { CATEGORY_SEED } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import { getLocalizedCategoryName } from '@/lib/translate-backend';
import Icon from '@/components/ui/Icon';
import styles from './ApplianceGrid.module.css';

const models = {
  refrigerators: 'refrigerator',
  'washing-machines': 'washer',
  'air-conditioners': 'ac',
  televisions: 'tv',
  microwaves: 'microwave',
  chimneys: 'chimney',
  'water-purifiers': 'purifier'
};

export default function ApplianceGrid() {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const categories = CATEGORY_SEED.filter((item) => item.type === 'appliance');

  return (
    <div className={styles.grid}>
      {categories.map((category, index) => (
        <Link key={category.slug} href={`/appliances/${category.slug}`} className={styles.card}>
          <span className={styles.index}>0{index + 1}</span>
          <div className={styles.visual}>
            <Image
              src={IMG.categories[category.imageKey]}
              alt={`${category.name} illustration`}
              fill
              sizes="(max-width:720px) 42vw, 170px"
              placeholder="blur"
              blurDataURL={IMG.blurDataURL}
              unoptimized
            />
            <span>360°</span>
          </div>
          <div className={styles.details}>
            <div>
              <b>{getLocalizedCategoryName(category.name, locale)}</b>
              <small>{locale === 'hi' ? 'श्रेणी देखें' : 'Explore range'}</small>
            </div>
            <Icon name="arrow" size={16} />
          </div>
        </Link>
      ))}
    </div>
  );
}
