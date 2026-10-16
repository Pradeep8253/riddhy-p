'use client';
import { useEffect, useRef } from 'react';
import './ScrollReveal.css';
export default function ScrollReveal({ children, delay=0, stagger=false }){
  const ref=useRef(null);
  useEffect(()=>{
    import('gsap').then(({gsap})=>{
      import('gsap/ScrollTrigger').then(({ScrollTrigger})=>{
        gsap.registerPlugin(ScrollTrigger);
        const el=ref.current;
        if(!el) return;
        const targets = stagger ? el.children : el;
        gsap.fromTo(targets,{y:22, opacity:0},{y:0, opacity:1, duration:0.7, stagger: stagger?0.08:0, ease:'power3.out', delay, scrollTrigger:{trigger:el, start:'top 88%', once:true}});
      });
    });
  },[delay, stagger]);
  return <div ref={ref} className="scroll-reveal">{children}</div>
}
