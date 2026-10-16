'use client';
import { useEffect, useRef, useState } from 'react';
export function useOnScreen(opts={}){
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    if(!ref.current) return;
    const io=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:0.15,...opts});
    io.observe(ref.current);
    return ()=>io.disconnect();
  },[]);
  return [ref,visible];
}
