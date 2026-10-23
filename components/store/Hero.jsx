'use client';

import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

// ── Image arrays ──────────────────────────────────────────────
const sliderImages = [
  { id: 1, src: '/hs2.webp', alt: 'Hero Slide 3' },
  { id: 2, src: '/s1.webp', alt: 'Hero Slide 1' },
  { id: 3, src: '/s2.webp', alt: 'Hero Slide 2' },
];

const sideImages = [
  { id: 1, src: '/hs1.webp', alt: 'Side Banner 1' },
  { id: 2, src: '/s3.webp', alt: 'Side Banner 2' },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const timerRef = useRef(null);

  const total = sliderImages.length;

  const goTo = (index, dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 520);
  };

  const prev = () => {
    const idx = (current - 1 + total) % total;
    goTo(idx, 'prev');
  };

  const next = () => {
    const idx = (current + 1) % total;
    goTo(idx, 'next');
  };

  const goToSlide = (i) => {
    if (i === current || animating) return;
    goTo(i, i > current ? 'next' : 'prev');
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      next();
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [current, animating]);

  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__slider">
          <div className="slider__track">
            {sliderImages.map((img, i) => (
              <div
                key={img.id}
                className={`slide ${i === current ? 'slide--active' : ''} ${
                  animating && i === current ? `slide--out-${direction}` : ''
                }`}
              >
                <img src={img.src} alt={img.alt} className="slide__img" />
                <div className="slide__overlay" />
              </div>
            ))}
          </div>

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
            {sliderImages.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`dot ${i === current ? 'dot--active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hero__side">
          {sideImages.map((img) => (
            <div key={img.id} className="side__card">
              <img src={img.src} alt={img.alt} className="side__img" />
              <div className="side__overlay" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
