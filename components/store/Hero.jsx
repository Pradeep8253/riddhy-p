'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './Hero.css';

// ── Default Banners (RF Riddhy Brand Showcase) ──────────────
const defaultSliderImages = [
  {
    id: 'default-marriage-hero',
    src: '/images/banners/marriage-packages-hero.jpg',
    alt: 'RF Riddhy 5 Exclusive Marriage Packages from ₹49,999',
    href: '/packages',
  },
  {
    id: 'default-furniture-appliances',
    src: '/images/banners/furniture-appliances-slider.jpg',
    alt: 'RF Riddhy Luxury Furniture & Smart Home Appliances',
    href: '/products',
  },
];

const defaultSideImages = [
  {
    id: 'default-top-card',
    src: '/images/banners/diwali-offer-banner.jpg',
    alt: 'Hero Right Top Banner',
    href: '/offers',
  },
  {
    id: 'default-bottom-card',
    src: '/images/banners/saadi-offer-banner.jpg',
    alt: 'Hero Right Bottom Banner',
    href: '/packages',
  },
];

const Hero = () => {
  const [slides, setSlides] = useState(defaultSliderImages);
  const [sideCards, setSideCards] = useState(defaultSideImages);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const timerRef = useRef(null);

  // Fetch live banners from CMS dynamically
  useEffect(() => {
    let isMounted = true;
    fetch('/api/banners?all=true', { cache: 'no-store' })
      .then((r) => r.json())
      .then((res) => {
        if (!isMounted) return;
        const allBanners = res.data || (Array.isArray(res) ? res : []);
        if (!allBanners || allBanners.length === 0) return;

        // 1. Slider banners: prioritize hero-slider
        let sliderCandidates = allBanners.filter(
          (b) => b.active !== false && b.zone === 'hero-slider' && (b.desktopImage || b.mobileImage)
        );
        if (sliderCandidates.length === 0) {
          sliderCandidates = allBanners.filter(
            (b) => b.active !== false && b.zone === 'home-hero' && (b.desktopImage || b.mobileImage)
          );
        }

        const customSlides = sliderCandidates
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((b) => ({
            id: b.id || b._id,
            src: b.desktopImage || b.mobileImage,
            alt: b.title || b.name || 'Hero Banner',
            href: b.href || '/packages',
          }));

        if (customSlides.length > 0) {
          setSlides(customSlides);
        }

        // 2. Right Top & Right Bottom Side Banners
        const customTop = allBanners.find(
          (b) => b.active !== false && b.zone === 'hero-side-top' && (b.desktopImage || b.mobileImage)
        );
        const customBottom = allBanners.find(
          (b) => b.active !== false && b.zone === 'hero-side-bottom' && (b.desktopImage || b.mobileImage)
        );

        setSideCards([
          customTop
            ? {
                id: customTop.id || customTop._id,
                src: customTop.desktopImage || customTop.mobileImage,
                alt: customTop.title || customTop.name || 'Hero Right Top Banner',
                href: customTop.href || '/offers',
              }
            : defaultSideImages[0],
          customBottom
            ? {
                id: customBottom.id || customBottom._id,
                src: customBottom.desktopImage || customBottom.mobileImage,
                alt: customBottom.title || customBottom.name || 'Hero Right Bottom Banner',
                href: customBottom.href || '/packages',
              }
            : defaultSideImages[1],
        ]);
      })
      .catch((err) => {
        // Fallback to default banners gracefully
        console.warn('Loaded default hero banners:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const total = slides.length;

  const goTo = (index, dir) => {
    if (animating || total <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 520);
  };

  const prev = () => {
    if (total <= 1) return;
    const idx = (current - 1 + total) % total;
    goTo(idx, 'prev');
  };

  const next = () => {
    if (total <= 1) return;
    const idx = (current + 1) % total;
    goTo(idx, 'next');
  };

  const goToSlide = (i) => {
    if (i === current || animating || total <= 1) return;
    goTo(i, i > current ? 'next' : 'prev');
  };

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      next();
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [current, animating, total]);

  return (
    <section className="hero">
      <div className="hero__inner">
        {/* LEFT MAIN SLIDER */}
        <div className="hero__slider">
          <div className="slider__track">
            {slides.map((img, i) => (
              <div
                key={img.id}
                className={`slide ${i === current ? 'slide--active' : ''} ${
                  animating && i === current ? `slide--out-${direction}` : ''
                }`}
              >
                <Link
                  href={img.href || '/packages'}
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  <img src={img.src} alt={img.alt} className="slide__img" />
                  <div className="slide__overlay" />
                </Link>
              </div>
            ))}
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                className="slider__arrow slider__arrow--prev"
                onClick={prev}
                aria-label="Previous"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M13 15l-5-5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="slider__arrow slider__arrow--next"
                onClick={next}
                aria-label="Next"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7 5l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="slider__dots">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dot ${i === current ? 'dot--active' : ''}`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT 2 PROMOTIONAL CARDS */}
        <div className="hero__side">
          {sideCards.map((img) => (
            <Link
              key={img.id}
              href={img.href || '/packages'}
              className="side__card"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <img src={img.src} alt={img.alt} className="side__img" />
              <div className="side__overlay" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

