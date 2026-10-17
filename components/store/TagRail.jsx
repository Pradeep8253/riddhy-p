'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { formatPriceSafe } from '@/lib/pricing';
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
  products = []
}) {
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter out any product without a valid price (> 0) to avoid "₹0 onwards"
  const validProducts = (products || []).filter((p) => {
    const price = Number(p.price);
    return Number.isFinite(price) && price > 0;
  });

  const checkScroll = () => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [validProducts]);

  const handleScroll = (direction) => {
    if (!railRef.current) return;
    const scrollAmount = railRef.current.clientWidth * 0.75;
    railRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!validProducts.length) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h2 className={styles.title}>{title}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Horizontal Rail */}
        <div className={styles.railWrapper}>
          <div
            ref={railRef}
            className={styles.rail}
            onScroll={checkScroll}
            tabIndex={0}
            role="region"
            aria-label={`${title} product carousel`}
          >
            {validProducts.map((product) => {
              const formattedPrice = formatPriceSafe(product.price);
              const warrantyLabel = extractWarrantyShort(product.warranty, product.type);
              const categoryLabel = product.categoryLabel || product.category || 'Home';
              const badge = product.badgeText || (
                tag === 'best-selling' ? 'Best Seller' :
                tag === 'popular' ? 'Popular' :
                tag === 'trending' ? 'Trending' :
                tag === 'new-arrival' ? 'New' : 'Featured'
              );

              // Use primary gallery image or fallback
              const imageUrl = product.image || product.gallery?.[0]?.url || '/placeholder.png';

              return (
                <Link
                  key={product.id || product.slug}
                  href={`/product/${product.slug}`}
                  className={styles.card}
                >
                  <div className={styles.imageContainer}>
                    {badge && <span className={styles.badge}>{badge}</span>}
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 200px, 260px"
                      className={styles.image}
                      loading="lazy"
                    />
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

                  {/* Soft tinted price strip - Never ₹0 or missing */}
                  <div className={styles.priceStrip}>
                    <span className={styles.priceText}>{formattedPrice} onwards</span>
                  </div>

                  {/* Two-line clamped title */}
                  <div className={styles.details}>
                    <h3 className={styles.productName}>{product.name}</h3>
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
