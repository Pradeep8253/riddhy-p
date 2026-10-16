'use client';
import { useEffect, useState } from 'react';
export function useLocalStorage(key, initial){
  const [val,setVal]=useState(()=>{
    if(typeof window==='undefined') return initial;
    try{ const s=localStorage.getItem(key); return s? JSON.parse(s): initial }catch{ return initial }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(val)) }catch{} },[key,val]);
  return [val,setVal];
}
