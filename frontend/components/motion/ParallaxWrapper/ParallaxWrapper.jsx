'use client';
import { useEffect, useRef } from 'react';
export default function ParallaxWrapper({ children, speed=0.2 }){
  const ref=useRef(null);
  useEffect(()=>{
    import('gsap').then(({gsap})=>{
      import('gsap/ScrollTrigger').then(({ScrollTrigger})=>{
        gsap.registerPlugin(ScrollTrigger);
        gsap.to(ref.current,{ yPercent: speed*100, ease:'none', scrollTrigger:{ trigger: ref.current, start:'top bottom', end:'bottom top', scrub: true }});
      });
    });
  },[speed]);
  return <div ref={ref}>{children}</div>
}
