'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_SEED } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import Icon from '@/components/ui/Icon';
import styles from './ApplianceGrid.module.css';

// Curated top 6 featured appliances for the homepage grid
const FEATURED_SLUGS = [
  'washing-machine',
  'fridge',
  'cooler',
  'gas-chulha',
  'mixer',
  'utensils-washer'
];

// Sequential alternating images of remaining appliances for card 07
const SEQUENCE_SLIDES = [
  { name: 'Air Conditioners', slug: 'air-conditioners', src: '/images/category-air-conditioners.webp' },
  { name: 'Televisions', slug: 'televisions', src: '/images/category-televisions.webp' },
  { name: 'Microwaves', slug: 'microwaves', src: '/images/category-microwaves.webp' },
  { name: 'Kitchen Chimneys', slug: 'chimneys', src: '/images/category-chimneys.webp' },
  { name: 'Water Purifiers', slug: 'water-purifiers', src: '/images/category-water-purifiers.webp' },
  { name: 'Iron (Press)', slug: 'iron', src: '/images/category-iron.webp' },
  { name: 'Roti Maker', slug: 'roti-maker', src: '/images/category-roti-maker.webp' },
  { name: 'Juicer & Blender', slug: 'juicer', src: '/images/category-juicer.webp' },
  { name: 'Diacut Cooler', slug: 'diacut-cooler', src: '/images/category-diacut-cooler.webp' }
];

export default function ApplianceGrid({ categories: propCategories, showAll = false }) {
  const [slideIndex, setSlideIndex] = useState(0);

  // Smoothly rotate the multi-image sequence every 2.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SEQUENCE_SLIDES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const allCategories = propCategories && propCategories.length > 0
    ? propCategories
    : CATEGORY_SEED.filter((item) => item.type === 'appliance');

  const displayCategories = showAll
    ? allCategories
    : FEATURED_SLUGS
        .map((slug) => allCategories.find((c) => c.slug === slug || c.slug === `${slug}s`))
        .filter(Boolean)
        .slice(0, 6);

  const activeSlide = SEQUENCE_SLIDES[slideIndex];

  return (
    <div className={styles.grid}>
      {displayCategories.map((category, index) => {
        const imgSrc =
          category.image ||
          IMG.categories[category.imageKey] ||
          IMG.categories[category.slug] ||
          '/images/category-refrigerators.webp';

        return (
          <Link key={category.slug} href={`/appliances/${category.slug}`} className={styles.card}>
            <span className={styles.index}>0{index + 1}</span>
            <div className={styles.visual}>
              <Image
                src={imgSrc}
                alt={`${category.name} illustration`}
                fill
                sizes="(max-width:720px) 42vw, 170px"
                placeholder="blur"
                blurDataURL={IMG.blurDataURL}
                unoptimized
              />
              <span className={styles.badge360}>360°</span>
            </div>
            <div className={styles.details}>
              <div>
                <b>{category.name}</b>
                <small>Explore range</small>
              </div>
              <Icon name="arrow" size={16} />
            </div>
          </Link>
        );
      })}

      {!showAll && (
        <Link href="/appliances" className={`${styles.card} ${styles.sequenceCard}`}>
          <span className={styles.index}>07</span>
          <div className={`${styles.visual} ${styles.sequenceVisual}`}>
            {SEQUENCE_SLIDES.map((slide, i) => (
              <div
                key={slide.slug}
                className={`${styles.sequenceSlide} ${i === slideIndex ? styles.sequenceSlideActive : ''}`}
                style={{ zIndex: i === slideIndex ? 2 : 1 }}
              >
                <Image
                  src={slide.src}
                  alt={`${slide.name} illustration`}
                  fill
                  sizes="(max-width:720px) 42vw, 170px"
                  placeholder="blur"
                  blurDataURL={IMG.blurDataURL}
                  unoptimized
                />
              </div>
            ))}
            <div className={styles.sequenceBadge}>+{SEQUENCE_SLIDES.length} More</div>
            <div className={styles.sequenceDots}>
              {SEQUENCE_SLIDES.map((_, i) => (
                <i
                  key={i}
                  className={`${styles.sequenceDot} ${i === slideIndex ? styles.sequenceDotActive : ''}`}
                />
              ))}
            </div>
          </div>
          <div className={styles.details}>
            <div>
              <b>{activeSlide.name}</b>
              <small>Explore all appliances</small>
            </div>
            <Icon name="arrow" size={16} />
          </div>
        </Link>
      )}
    </div>
  );
}
