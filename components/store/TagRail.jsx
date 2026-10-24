'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { MapPin, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { formatPriceSafe } from '@/lib/pricing';
import {
  getLocalizedProductName,
  getLocalizedCategoryName,
  getLocalizedBadge,
  getLocalizedWarranty,
  getLocalizedSectionHeader
} from '@/lib/translate-backend';
import styles from './TagRail.module.css';

function extractWarrantyShort(warranty, type) {
  if (!warranty) return type === 'appliance' ? '1 Yr' : '2 Yr';
  const text = typeof warranty === 'string'
    ? warranty
    : [warranty.seller, warranty.manufacturer, warranty.compressor].filter(Boolean).join(' ');
  const match = text.match(/(\d+)\s*(?:year|yr)/i);
  if (match) return `${match[1]} Yr`;
  return type === 'appliance' ? '1 Yr' : '2 Yr';
}

export default function TagRail({
  title = 'Best Selling',
  eyebrow = 'Curated Recommendations',
  tag = 'best-selling',
  viewAllHref = '/collections/best-selling',
  products = [],
  className = '',
  style,
  autoSlide = true,
  autoSlideInterval = 2500
}) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const validProducts = (products || []).filter((p) => {
    const price = Number(p.price);
    return Number.isFinite(price) && price > 0;
  });

  // Seamless infinite loop: clone 3 sets so the user can scroll forwards/backwards infinitely
  const isInfinite = validProducts.length >= 3;
  const displayProducts = isInfinite
    ? [...validProducts, ...validProducts, ...validProducts]
    : validProducts;

  const getLoopWidth = useCallback(() => {
    if (!railRef.current || !isInfinite) return 0;
    const cards = railRef.current.querySelectorAll(`.${styles.card}`);
    const L = validProducts.length;
    if (cards[L] && cards[0]) {
      return cards[L].offsetLeft - cards[0].offsetLeft;
    }
    return 0;
  }, [isInfinite, validProducts.length]);

  const checkScroll = useCallback(() => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    if (isInfinite) {
      setCanScrollLeft(true);
      setCanScrollRight(true);
    } else {
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, [isInfinite]);

  // Position at Set 2 on mount so infinite scrolling works in both directions from the start
  useEffect(() => {
    if (!railRef.current || !isInfinite) return;
    const rail = railRef.current;
    const raf = requestAnimationFrame(() => {
      const cards = rail.querySelectorAll(`.${styles.card}`);
      const L = validProducts.length;
      if (cards[L] && cards[0]) {
        const loopWidth = cards[L].offsetLeft - cards[0].offsetLeft;
        if (loopWidth > 0 && rail.scrollLeft < 10) {
          rail.style.scrollBehavior = 'auto';
          rail.scrollLeft = loopWidth;
          rail.style.scrollBehavior = '';
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isInfinite, validProducts.length]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [validProducts, checkScroll]);

  // Track viewport visibility with IntersectionObserver
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const getScrollStep = useCallback(() => {
    if (!railRef.current) return 280;
    const firstCard = railRef.current.querySelector(`.${styles.card}`);
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      const gap = parseFloat(window.getComputedStyle(railRef.current).gap) || 20;
      return cardRect.width + gap;
    }
    return 280;
  }, []);

  const handleScroll = useCallback((direction) => {
    if (!railRef.current) return;
    const rail = railRef.current;
    const loopWidth = getLoopWidth();

    // In infinite mode, silently adjust offset if near boundary before scrolling
    if (isInfinite && loopWidth > 0) {
      if (direction === 'left' && rail.scrollLeft <= loopWidth * 0.2) {
        rail.style.scrollBehavior = 'auto';
        rail.scrollLeft += loopWidth;
        rail.style.scrollBehavior = '';
      } else if (direction === 'right' && rail.scrollLeft >= 2 * loopWidth - 20) {
        rail.style.scrollBehavior = 'auto';
        rail.scrollLeft -= loopWidth;
        rail.style.scrollBehavior = '';
      }
    }

    const step = getScrollStep();
    rail.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
  }, [getScrollStep, getLoopWidth, isInfinite]);

  // Infinite continuous auto-slide effect
  useEffect(() => {
    if (!autoSlide || !isInView || isPaused || validProducts.length <= 2) return;

    const timer = setInterval(() => {
      if (!railRef.current || (typeof document !== 'undefined' && document.visibilityState !== 'visible')) return;
      const rail = railRef.current;
      const loopWidth = getLoopWidth();

      // Silent seamless reset: if in third set, seamlessly shift by -loopWidth to set 2 without animation interruption
      if (isInfinite && loopWidth > 0 && rail.scrollLeft >= 2 * loopWidth - 10) {
        rail.style.scrollBehavior = 'auto';
        rail.scrollLeft -= loopWidth;
        rail.style.scrollBehavior = '';
      }

      const step = getScrollStep();
      rail.scrollBy({ left: step, behavior: 'smooth' });
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [autoSlide, isInView, isPaused, validProducts.length, autoSlideInterval, getScrollStep, getLoopWidth, isInfinite]);

  if (!validProducts.length) {
    return null;
  }

  const localizedEyebrow = getLocalizedSectionHeader(eyebrow, locale);
  const localizedTitle = getLocalizedSectionHeader(title, locale);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${className}`}
      style={style}
      aria-label={localizedTitle}
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {localizedEyebrow && <span className={styles.eyebrow}>{localizedEyebrow}</span>}
            <h2 className={styles.title}>{localizedTitle}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Horizontal Rail with Seamless Infinite Loop & Pause on Hover/Touch */}
        <div
          className={styles.railWrapper}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={railRef}
            className={styles.rail}
            onScroll={checkScroll}
            tabIndex={0}
            role="region"
            aria-label={`${localizedTitle} product carousel`}
          >
            {displayProducts.map((product, idx) => {
              const formattedPrice = formatPriceSafe(product.price);
              const warrantyRaw = extractWarrantyShort(product.warranty, product.type);
              const warrantyLabel = getLocalizedWarranty(warrantyRaw, locale);
              const categoryRaw = product.categoryLabel || product.category || 'Home';
              const categoryLabel = getLocalizedCategoryName(categoryRaw, locale);

              // Strict tag-based badge: Trending only shows Trending, New Arrival only shows New Arrival, etc.
              const badgeRaw =
                tag === 'trending' ? 'Trending' :
                tag === 'new-arrival' ? 'New Arrival' :
                tag === 'best-selling' ? 'Best Seller' :
                tag === 'popular' ? 'Popular' :
                (product.badgeText || 'Featured');

              const badge = getLocalizedBadge(badgeRaw, locale);
              const productName = getLocalizedProductName(product, locale);

              // Use primary gallery image or fallback
              const imageUrl = product.image || product.gallery?.[0]?.url || '/placeholder.png';
              const secondaryImageUrl = product.gallery?.find?.((g) => g.view === 'back')?.url || product.gallery?.[1]?.url || null;

              return (
                <Link
                  key={`${product.id || product.slug}-loop-${idx}`}
                  href={`/product/${product.slug}`}
                  className={styles.card}
                >
                  <div className={styles.imageContainer}>
                    {badge && <span className={styles.badge}>{badge}</span>}
                    <Image
                      src={imageUrl}
                      alt={productName}
                      fill
                      sizes="(max-width: 640px) 200px, 260px"
                      className={`${styles.image} ${secondaryImageUrl ? styles.hasSecondary : ''}`}
                      loading="lazy"
                    />
                    {secondaryImageUrl && (
                      <Image
                        src={secondaryImageUrl}
                        alt={`${productName} rear angle`}
                        fill
                        sizes="(max-width: 640px) 200px, 260px"
                        className={styles.secondaryImage}
                        loading="lazy"
                      />
                    )}
                    <div className={styles.gradientOverlay}>
                      <span className={styles.chip}>
                        <MapPin size={10} />
                        <span>{categoryLabel}</span>
                      </span>
                      <span className={styles.chip}>
                        <Clock size={10} />
                        <span>{warrantyLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Soft tinted price strip */}
                  <div className={styles.priceStrip}>
                    <span className={styles.priceText}>
                      {formattedPrice} onwards
                    </span>
                  </div>

                  {/* Two-line clamped title */}
                  <div className={styles.details}>
                    <h3 className={styles.productName}>{productName}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Centered round outline controls */}
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous products"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next products"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
