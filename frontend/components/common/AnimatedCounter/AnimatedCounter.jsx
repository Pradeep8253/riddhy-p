'use client';
import { useEffect, useRef } from 'react';
import './AnimatedCounter.css';
export default function AnimatedCounter({ value=0, prefix='', suffix='' }){
  const ref=useRef(null);
  useEffect(()=>{
    import('gsap').then(({gsap})=>{
      const obj={v:0};
      gsap.to(obj,{v:value, duration:1.2, ease:'power3.out', onUpdate:()=>{ if(ref.current) ref.current.textContent = prefix + Math.round(obj.v).toLocaleString('en-IN') + suffix }});
    });
  },[value,prefix,suffix]);
  return <span ref={ref} className="animated-counter">{prefix}{value}{suffix}</span>
}
