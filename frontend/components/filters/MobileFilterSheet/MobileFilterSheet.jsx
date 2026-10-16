'use client';
import { useLenis } from '@/hooks/useLenis';
import { useEffect } from 'react';
import './MobileFilterSheet.css';
export default function MobileFilterSheet({ open, onClose, children }){
  const lenis=useLenis();
  useEffect(()=>{ if(open) lenis?.stop(); else lenis?.start(); },[open,lenis]);
  if(!open) return null;
  return <div className="msheet"><div className="msheet__backdrop" onClick={onClose}/><div className="msheet__panel"><div className="msheet__head"><strong>Filters</strong><button onClick={onClose}>✕</button></div><div className="msheet__body">{children}</div></div></div>
}
