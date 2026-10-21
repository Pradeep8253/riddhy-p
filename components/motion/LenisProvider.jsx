'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LenisProvider({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  useEffect(() => {
    if (isAdmin) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis;
    let raf = 0;
    let gsap;
    let ScrollTrigger;
    let alive = true;

    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([lenisMod, gsapMod, scrollMod]) => {
      if (!alive) return;
      const Lenis = lenisMod.default;
      gsap = gsapMod.gsap;
      ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.2 });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time) => { lenis?.raf(time * 1000); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }).catch(() => {});

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [isAdmin]);

  return children;
}
