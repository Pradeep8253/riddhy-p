'use client';
import { useEffect, useState } from 'react';
export function useMediaQuery(query){
  const [m,setM]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia(query);
    const h=()=>setM(mq.matches);
    h(); mq.addEventListener('change',h);
    return ()=>mq.removeEventListener('change',h);
  },[query]);
  return m;
}
