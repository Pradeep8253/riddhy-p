'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import './Hero.css';

const fallbackSlides = [
  { id: 'fallback-furniture', src: '/images/banners/hero-slide-1-furniture.webp', mobileSrc: '/images/banners/hero-slide-1-furniture-mobile.webp', alt: 'Furniture collection', href: '/furniture' },
  { id: 'fallback-appliances', src: '/images/banners/hero-slide-2-appliances.webp', mobileSrc: '/images/banners/hero-slide-2-appliances-mobile.webp', alt: 'Home appliances collection', href: '/appliances' },
  { id: 'fallback-diwali', src: '/images/banners/hero-slide-3-diwali.webp', mobileSrc: '/images/banners/hero-slide-3-diwali-mobile.webp', alt: 'Diwali offer', href: '/offers' },
  { id: 'fallback-wedding', src: '/images/banners/hero-slide-4-wedding.webp', mobileSrc: '/images/banners/hero-slide-4-wedding-mobile.webp', alt: 'Wedding packages', href: '/packages' },
];

const fallbackSideCards = [
  { id: 'fallback-side-top', src: '/images/banners/banner-diwali-right-top.webp', alt: 'Diwali offer', href: '/offers' },
  { id: 'fallback-side-bottom', src: '/images/banners/banner-wedding-right-bottom.webp', alt: 'Wedding packages', href: '/packages' },
];

const Hero = ({ initialSlides = [], initialSideCards = [] }) => {
  const [slides, setSlides] = useState(initialSlides.length ? initialSlides : fallbackSlides);
  const [sideCards, setSideCards] = useState(initialSideCards.length ? initialSideCards : fallbackSideCards);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (initialSlides.length) setSlides(initialSlides);
  }, [initialSlides]);

  useEffect(() => {
    if (initialSideCards.length) setSideCards(initialSideCards);
  }, [initialSideCards]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/banners?all=true', { cache: 'no-store' })
      .then((response) => response.json())
      .then((res) => {
        if (!mounted) return;
        const banners = res.data || (Array.isArray(res) ? res : []);
        const active = banners.filter((banner) => banner.active !== false && (banner.desktopImage || banner.mobileImage));
        let sliderBanners = active.filter((banner) => banner.zone === 'hero-slider');
        if (!sliderBanners.length) sliderBanners = active.filter((banner) => banner.zone === 'home-hero');

        const cmsSlides = sliderBanners
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((banner) => ({
            id: banner.id || banner._id,
            src: banner.desktopImage || banner.mobileImage,
            mobileSrc: banner.mobileImage || '',
            alt: banner.title || banner.name || 'Hero banner',
            href: banner.href || '/packages',
          }));
        if (cmsSlides.length) setSlides(cmsSlides);

        const cmsCards = [
          ['hero-side-top', '/offers'],
          ['hero-side-bottom', '/packages'],
        ].map(([zone, fallbackHref]) => {
          const banner = active.find((item) => item.zone === zone);
          return banner ? {
            id: banner.id || banner._id,
            src: banner.desktopImage || banner.mobileImage,
            mobileSrc: banner.mobileImage || '',
            alt: banner.title || banner.name || 'Promotional banner',
            href: banner.href || fallbackHref,
          } : null;
        }).filter(Boolean);
        if (cmsCards.length) setSideCards(cmsCards);
      })
      .catch((error) => console.warn('Backend hero banners fetch error:', error));

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setCurrent((index) => Math.min(index, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  const move = useCallback((step) => {
    setCurrent((index) => (index + step + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1 || typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => move(1), 5000);
    return () => window.clearInterval(timer);
  }, [move, paused, slides.length]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  };

  const onTouchStart = (event) => { event.currentTarget.dataset.touchStartX = event.touches[0].clientX; };
  const onTouchEnd = (event) => {
    const start = Number(event.currentTarget.dataset.touchStartX);
    if (!start) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    delete event.currentTarget.dataset.touchStartX;
  };

  return (
    <section className="hero" aria-label="Featured collections and offers">
      <div className="hero__inner">
        <div
          className="hero__slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured banners"
          tabIndex="0"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="slider__track" aria-live="off">
            {slides.map((slide, index) => (
              <div key={slide.id || slide.src || index} className={`slide${index === current ? ' slide--active' : ''}`} aria-hidden={index !== current}>
                <Link href={slide.href || '/packages'} className="slide__link" tabIndex={index === current ? 0 : -1} aria-label={slide.alt || `Featured banner ${index + 1}`}>
                  <picture>
                    {slide.mobileSrc && <source media="(max-width: 600px)" srcSet={slide.mobileSrc} />}
                    <img src={slide.src} alt={slide.alt || ''} className="slide__img" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} />
                  </picture>
                </Link>
              </div>
            ))}
          </div>

          {slides.length > 1 && <>

            <div className="slider__dots" role="group" aria-label="Choose a banner">
              {slides.map((slide, index) => <button key={slide.id || index} type="button" className={`dot${index === current ? ' dot--active' : ''}`} onClick={() => setCurrent(index)} aria-label={`Go to banner ${index + 1}`} aria-current={index === current ? 'true' : undefined} />)}
            </div>
          </>}
        </div>

        <div className="hero__side" aria-label="More offers">
          {sideCards.map((card, index) => (
            <Link key={card.id || card.src || index} href={card.href || '/packages'} className="side__card" aria-label={card.alt || `Featured offer ${index + 1}`}>
              <picture>
                {card.mobileSrc && <source media="(max-width: 600px)" srcSet={card.mobileSrc} />}
                <img src={card.src} alt={card.alt || ''} className="side__img" loading="lazy" />
              </picture>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
