'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const [categoriesList, setCategoriesList] = useState(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategoriesList(propCategories);
    } else {
      fetch('/api/categories?type=appliance')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && Array.isArray(json?.data)) {
            setCategoriesList(json.data);
          }
        })
        .catch(() => {});
    }
  }, [propCategories]);

  const sequenceSlides = useMemo(() => {
    const remaining = categoriesList.filter(
      (c) => !FEATURED_SLUGS.includes(c.slug) && (c.image || c.src)
    );
    if (remaining.length > 0) {
      return remaining.map((c) => ({
        name: c.name,
        slug: c.slug,
        src: c.image || c.src
      }));
    }
    return SEQUENCE_SLIDES;
  }, [categoriesList]);

  // Smoothly rotate the multi-image sequence every 2.2 seconds
  useEffect(() => {
    if (sequenceSlides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sequenceSlides.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [sequenceSlides.length]);

  const allCategories = categoriesList;

  const displayCategories = showAll
    ? allCategories
    : FEATURED_SLUGS
        .map((slug) => {
          const variants = [slug, `${slug}s`, slug.replace(/s$/, '')];
          if (slug === 'fridge') variants.push('refrigerators', 'refrigerator');
          if (slug === 'washing-machine') variants.push('washing-machines');
          if (slug === 'cooler') variants.push('diacut-cooler');
          return allCategories.find((c) => variants.includes(c.slug));
        })
        .filter(Boolean)
        .slice(0, 6);

  const activeSlide = sequenceSlides[slideIndex] || sequenceSlides[0] || { name: 'Appliances', slug: 'appliances' };

  return (
    <div className={styles.grid}>
      {displayCategories.map((category, index) => {
        const imgSrc =
          category.image ||
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
            {sequenceSlides.map((slide, i) => (
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
                  unoptimized
                />
              </div>
            ))}
            <div className={styles.sequenceBadge}>+{sequenceSlides.length} More</div>
            <div className={styles.sequenceDots}>
              {sequenceSlides.map((_, i) => (
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
