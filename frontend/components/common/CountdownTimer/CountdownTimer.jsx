'use client';
import { useEffect, useState } from 'react';
import './CountdownTimer.css';
export default function CountdownTimer({ deadline }){
  const calc=()=> Math.max(0, Math.floor((new Date(deadline)-new Date())/1000));
  const [sec,setSec]=useState(calc);
  useEffect(()=>{
    const t=setInterval(()=>setSec(calc()),1000);
    return ()=>clearInterval(t);
  },[deadline]);
  const h=String(Math.floor(sec/3600)).padStart(2,'0');
  const m=String(Math.floor((sec%3600)/60)).padStart(2,'0');
  const s=String(sec%60).padStart(2,'0');
  if(sec<=0) return <span className="countdown countdown--ended">Deal ended</span>
  return <div className="countdown" aria-live="polite"><span className="countdown__box">{h}<small>h</small></span><span className="countdown__sep">:</span><span className="countdown__box">{m}<small>m</small></span><span className="countdown__sep">:</span><span className="countdown__box">{s}<small>s</small></span></div>
}
