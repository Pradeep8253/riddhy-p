'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './IntroPreloader.module.css';

const MIN_DISPLAY_MS = 2500;
const SAFETY_TIMEOUT_MS = 6500;

export default function IntroPreloader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const startTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const hasFinishedRef = useRef(false);

  const cleanupScrollLock = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    setProgress(100);
    setVisible(false);
    cleanupScrollLock();
  }, [cleanupScrollLock]);

  const handleExitComplete = useCallback(() => {
    cleanupScrollLock();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
    }
  }, [cleanupScrollLock]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotionActive = mediaQuery.matches;
    setIsReducedMotion(reducedMotionActive);

    const handleMotionChange = (e) => {
      setIsReducedMotion(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    }

    // Lock body scroll during preloader
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    setMounted(true);
    setVisible(true);
    startTimeRef.current = performance.now();

    let pageLoaded = document.readyState === 'complete';

    const handlePageLoad = () => {
      pageLoaded = true;
    };

    if (!pageLoaded) {
      window.addEventListener('load', handlePageLoad, { once: true });
    }

    // Escape key listener to skip
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Progress animation loop
    const tick = () => {
      if (hasFinishedRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const timeRatio = Math.min(elapsed / MIN_DISPLAY_MS, 1);

      if (!pageLoaded) {
        // Smoothly approach ~88% while awaiting window load
        const target = Math.min(88, timeRatio * 90);
        setProgress((prev) => Math.max(prev, target));
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // Page is loaded: advance smoothly to 100%
        if (elapsed < MIN_DISPLAY_MS) {
          const target = Math.min(97, timeRatio * 100);
          setProgress((prev) => Math.max(prev, target));
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          // Both min display duration (~2.5s) and page load are complete
          setProgress(100);
          hasFinishedRef.current = true;

          // Brief cinematic hold at 100% before triggering smooth zoom-out fade exit
          window.setTimeout(() => {
            setVisible(false);
          }, 200);
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    // Safety fallback: ensure preloader releases even if an external resource stalls
    const safetyTimer = window.setTimeout(() => {
      if (!hasFinishedRef.current) {
        pageLoaded = true;
      }
    }, SAFETY_TIMEOUT_MS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.clearTimeout(safetyTimer);
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('keydown', handleKeyDown);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      }
      cleanupScrollLock();
    };
  }, [handleDismiss, cleanupScrollLock]);

  if (!mounted) return null;

  // Custom smooth cubic-bezier curves
  const easeOutExpo = [0.16, 1, 0.3, 1];
  const easeInOutCinematic = [0.76, 0, 0.24, 1];

  const formattedPercent = Math.min(100, Math.floor(progress))
    .toString()
    .padStart(3, '0');

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {visible && (
        <motion.aside
          key="rf-cinematic-preloader"
          className={styles.overlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: isReducedMotion ? 0.25 : 0.85,
              ease: easeInOutCinematic,
            },
          }}
          role="status"
          aria-live="polite"
          aria-label="Welcome to RF Riddhy"
        >
          {/* Multi-stage Vignette & Organic Film Grain */}
          <div className={styles.vignette} aria-hidden="true" />
          <div className={styles.grain} aria-hidden="true" />

          {/* Anamorphic Horizontal Light Streak */}
          <motion.div
            className={styles.anamorphicBeam}
            aria-hidden="true"
            initial={isReducedMotion ? { opacity: 0.3 } : { opacity: 0, scaleX: 0.3 }}
            animate={
              isReducedMotion
                ? { opacity: 0.3 }
                : {
                    opacity: [0.35, 0.75, 0.4],
                    scaleX: [0.85, 1.08, 0.95],
                  }
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />

          {/* Glassmorphic Skip Button */}
          <button
            type="button"
            className={styles.skipButton}
            onClick={handleDismiss}
            aria-label="Skip intro and view storefront immediately"
          >
            <span>Skip</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Central Hero Lockup: Vignette Glow + Logo */}
          <div className={styles.centerContainer}>
            {/* Outer Emerald-Gold Atmospheric Aura */}
            <motion.div
              className={styles.outerHalo}
              aria-hidden="true"
              initial={isReducedMotion ? { opacity: 0.4 } : { opacity: 0, scale: 0.8 }}
              animate={
                isReducedMotion
                  ? { opacity: 0.4 }
                  : {
                      opacity: [0.3, 0.65, 0.35],
                      scale: [0.9, 1.08, 0.94],
                    }
              }
              transition={{
                duration: 4.2,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
            />

            {/* Core Warm Gold Vignette Glow behind Logo */}
            <motion.div
              className={styles.vignetteGlow}
              aria-hidden="true"
              initial={isReducedMotion ? { opacity: 0.5 } : { opacity: 0, scale: 0.85 }}
              animate={
                isReducedMotion
                  ? { opacity: 0.5 }
                  : {
                      opacity: [0.4, 0.8, 0.5],
                      scale: [0.92, 1.06, 0.95],
                    }
              }
              transition={{
                duration: 3.2,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
            />

            {/* Logo Container with Blur-to-Sharp Entrance, Hold, and Zoom-Out Exit */}
            <motion.div
              className={styles.logoWrapper}
              initial={
                isReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.88, filter: 'blur(22px) brightness(1.3)' }
              }
              animate={
                isReducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      filter: 'blur(0px) brightness(1)',
                      transition: {
                        duration: 1.25,
                        ease: easeOutExpo,
                      },
                    }
              }
              exit={
                isReducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.82,
                      filter: 'blur(8px)',
                      transition: {
                        duration: 0.85,
                        ease: easeInOutCinematic,
                      },
                    }
              }
            >
              {/* Picture tag loading /logo.avif with PNG fallback */}
              <picture className={styles.logoPicture}>
                <source srcSet="/logo.avif" type="image/avif" />
                <img
                  src="/logo.png"
                  alt="RF Riddhy - Furniture & Home Appliances"
                  className={styles.logoImage}
                  width={1127}
                  height={408}
                  fetchPriority="high"
                  decoding="sync"
                />
              </picture>

              {/* Shimmering Specular Light Glint across Logo */}
              {!isReducedMotion && (
                <motion.div
                  className={styles.shimmerGlint}
                  aria-hidden="true"
                  initial={{ x: '-160%' }}
                  animate={{ x: '180%' }}
                  transition={{
                    delay: 0.75,
                    duration: 1.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              )}
            </motion.div>

            {/* Subtle Metallic Gold Subtitle */}
            <motion.div
              className={styles.subtext}
              initial={{ opacity: 0, y: isReducedMotion ? 0 : 10 }}
              animate={{
                opacity: 0.85,
                y: 0,
                transition: {
                  delay: isReducedMotion ? 0 : 0.45,
                  duration: 0.9,
                  ease: easeOutExpo,
                },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.35 },
              }}
              aria-hidden="true"
            >
              <span>Furniture</span>
              <span className={styles.subtextDot} />
              <span>Home Appliances</span>
            </motion.div>
          </div>

          {/* Telemetry HUD Line above Loading Bar */}
          <div className={styles.hudLine} aria-hidden="true">
            <div className={styles.hudBrand}>
              <span className={styles.hudStatusDot} />
              <span>RF RIDDHY</span>
              <span>&bull;</span>
              <span>EXPERIENCE</span>
            </div>
            <div className={styles.hudPercent}>
              {formattedPercent}%
            </div>
          </div>

          {/* Thin Animated Loading Bar at the Bottom */}
          <div className={styles.bottomBarContainer} aria-hidden="true">
            <div className={styles.loadingTrack}>
              <motion.div
                className={styles.loadingBarFill}
                style={{
                  scaleX: Math.min(progress / 100, 1),
                }}
                transition={{
                  duration: 0.15,
                  ease: 'linear',
                }}
              />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
