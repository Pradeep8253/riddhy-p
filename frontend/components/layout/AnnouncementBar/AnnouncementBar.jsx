'use client';
import { useEffect, useState } from 'react';
import './AnnouncementBar.css';
const messages = [
  '✨ Extra 10% off on first order — Use code WELCOME500',
  '🚚 Free delivery on orders above ₹15,000 — Kanpur & 120+ cities',
  '🛡️ 3-Year warranty + Free installation on furniture',
  '💳 No-Cost EMI available on appliances'
];
export default function AnnouncementBar(){
  const [idx,setIdx]=useState(0);
  useEffect(()=>{ const t=setInterval(()=> setIdx(i=> (i+1)%messages.length), 3000); return ()=>clearInterval(t); },[]);
  return <div className="announcement"><div className="announcement__track"><span className="announcement__text">{messages[idx]}</span><span className="announcement__dot">•</span><span className="announcement__cta">Shop Now →</span></div></div>
}
