'use client';

import { useEffect, useState } from 'react';
export default function Countdown({ endsAt, compact = false }) {
  const getRemaining = () => Math.max(0, new Date(endsAt).getTime() - Date.now());
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => { const timer=window.setInterval(()=>setRemaining(getRemaining()),1000); return ()=>window.clearInterval(timer); },[endsAt]);
  if (remaining <= 0) return <span className="countdown-ended">Campaign ended</span>;
  const days=Math.floor(remaining/86400000), hours=Math.floor((remaining%86400000)/3600000), minutes=Math.floor((remaining%3600000)/60000), seconds=Math.floor((remaining%60000)/1000);
  return <span className={compact?'countdown-compact':'countdown'} aria-label={`${days} days ${hours} hours remaining`}><b>{String(days).padStart(2,'0')}<i>d</i></b><b>{String(hours).padStart(2,'0')}<i>h</i></b><b>{String(minutes).padStart(2,'0')}<i>m</i></b>{!compact&&<b>{String(seconds).padStart(2,'0')}<i>s</i></b>}</span>;
}
