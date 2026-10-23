'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HomeHero from '@/components/store/HomeHero';
import Icon from '@/components/ui/Icon';
import styles from './HomePromotionalBanner.module.css';

export default function HomePromotionalBanner({ initialBanners = null }) {
  const [banners, setBanners] = useState(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch('/api/banners?zone=home-hero')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        })
        .catch(() => {
          // Graceful silent fallback
        });
    }
  }, [initialBanners]);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Autoplay timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, nextSlide]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  if (!banners || banners.length === 0) {
    return <HomeHero />;
  }

  const activeBanner = banners[currentIndex] || banners[0];

  return (
    <section
      className={styles.sliderWrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Promotional campaigns carousel"
      aria-roledescription="carousel"
    >
      <div
        className={styles.slideTrack}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, idx) => {
          const isCurrent = idx === currentIndex;
          const bgImg = banner.desktopImage || banner.mobileImage || '/images/hero-desktop.webp';

          return (
            <div
              key={banner.id || idx}
              className={`${styles.slide} ${isCurrent ? styles.slideActive : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${banners.length}: ${banner.title}`}
              aria-hidden={!isCurrent}
            >
              {/* Background Image with optimized loading */}
              <img
                src={bgImg}
                alt={banner.alt || banner.title || 'RF Riddhy Promotion'}
                className={styles.bgImage}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Gradient Overlay */}
              <div className={styles.overlay} />

              {/* Content Box */}
              <div className="container" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                <div className={styles.content}>
                  {banner.campaignTag && (
                    <span className={styles.campaignBadge}>
                      {banner.campaignTag}
                    </span>
                  )}

                  <h2 className={styles.title}>{banner.title}</h2>
                  {banner.subtitle && <p className={styles.subtitle}>{banner.subtitle}</p>}
                  {banner.description && (
                    <p className={styles.description}>{banner.description}</p>
                  )}

                  <div className={styles.actions}>
                    {banner.href && (
                      <Link href={banner.href} className={styles.primaryCta}>
                        {banner.ctaText || 'Explore Offers'} <Icon name="arrow" size={15} />
                      </Link>
                    )}

                    <a
                      href={`https://wa.me/919934208035?text=${encodeURIComponent(
                        `Hello RF Riddhy, I saw your promotional banner "${banner.title}" and would like more details and pricing.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappCta}
                    >
                      <Icon name="whatsapp" size={16} /> Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.prevBtn}`}
            onClick={prevSlide}
            aria-label="Previous promotional slide"
          >
            <Icon name="arrowLeft" size={18} />
          </button>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.nextBtn}`}
            onClick={nextSlide}
            aria-label="Next promotional slide"
          >
            <Icon name="arrow" size={18} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className={styles.dotsContainer} role="tablist" aria-label="Carousel pagination">
          {banners.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-selected={dotIdx === currentIndex}
              className={`${styles.dot} ${dotIdx === currentIndex ? styles.dotActive : ''}`}
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
