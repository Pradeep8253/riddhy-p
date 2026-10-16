'use client';
import { useState } from 'react';
import './Tabs.css';
export default function Tabs({ tabs=[], initial=0 }){
  const [a,setA]=useState(initial);
  return <div className="tabs">
    <div className="tabs__nav" role="tablist">{tabs.map((t,i)=><button key={i} role="tab" aria-selected={a===i} className={`tabs__btn ${a===i?'tabs__btn--active':''}`} onClick={()=>setA(i)}>{t.label}</button>)}</div>
    <div className="tabs__panel">{tabs[a]?.content}</div>
  </div>
}
