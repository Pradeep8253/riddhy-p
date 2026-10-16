'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { banners } from '@/data/products';
import './HeroSlider.css';
export default function HeroSlider(){
  const [idx,setIdx]=useState(0);
  useEffect(()=>{ const t=setInterval(()=> setIdx(i=> (i+1)%banners.length), 4500); return ()=>clearInterval(t); },[]);
  const b=banners[idx];
  return (
    <div className="hero">
      <AnimatePresence mode="wait">
        <motion.div key={b.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.6}} className="hero__slide" style={{background:b.bg}}>
          <div className="hero__content">
            <span className="hero__eyebrow">RF Riddhy • Trusted since 2014</span>
            <h1 className="hero__title">{b.title}</h1>
            <p className="hero__subtitle">{b.subtitle}</p>
            <div className="hero__ctas">
              <Link href="/furniture" className="hero__cta hero__cta--primary">{b.cta}</Link>
              <Link href="/appliances" className="hero__cta hero__cta--ghost">View Appliances</Link>
            </div>
            <div className="hero__trust"><span>✓ Free Installation</span><span>✓ No-Cost EMI</span><span>✓ 3-Year Warranty</span></div>
          </div>
          <div className="hero__media">
            <img src={b.image} alt={b.title}/>
            <div className="hero__card"><strong>From ₹18,990</strong><small>EMI starts ₹1,499/mo</small></div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="hero__dots">{banners.map((_,i)=> <button key={i} onClick={()=>setIdx(i)} className={`hero__dot ${i===idx?'hero__dot--active':''}`} aria-label={`Go to slide ${i+1}`}/>)}</div>
      <button className="hero__arrow hero__arrow--prev" onClick={()=>setIdx(i=> (i-1+banners.length)%banners.length)}>‹</button>
      <button className="hero__arrow hero__arrow--next" onClick={()=>setIdx(i=> (i+1)%banners.length)}>›</button>
    </div>
  );
}
