'use client';
import { useEffect, useRef, useState } from 'react';
import { LenisContext } from '@/hooks/useLenis';
import { createLenis } from '@/lib/lenis';

export default function SmoothScrollProvider({ children }){
  const lenisRef = useRef(null);
  const [lenis,setLenis]=useState(null);

  useEffect(()=>{
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced) return;

    let rafId;
    const lenisInstance = createLenis();
    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    // GSAP ticker sync if available
    let gsapTicker;
    import('gsap').then(({gsap})=>{
      try{
        gsap.ticker.add((time)=> lenisInstance.raf(time*1000));
        gsap.ticker.lagSmoothing(0);
        gsapTicker = gsap.ticker;
      }catch{}
    });

    const raf = (time)=>{ lenisInstance.raf(time); rafId=requestAnimationFrame(raf); };
    rafId=requestAnimationFrame(raf);

    return ()=>{
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      if(gsapTicker) try{ gsapTicker.remove(()=>{}) }catch{}
    };
  },[]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
