'use client';
import { useState } from 'react';
import './CouponInput.css';
export default function CouponInput({ onApply, coupon }){
  const [code,setCode]=useState(coupon?.code || '');
  const [msg,setMsg]=useState('');
  const apply=()=>{
    const r=onApply(code);
    setMsg(r.ok? `✓ Coupon ${r.code} applied - ₹${r.value} off` : r.message);
  };
  return <div className="coupon">
    <div className="coupon__row"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter coupon code (TRY WELCOME500)"/><button onClick={apply}>Apply</button></div>
    {msg && <div className={`coupon__msg ${msg.startsWith('✓')?'coupon__msg--ok':''}`}>{msg}</div>}
    <div className="coupon__hints">Try: WELCOME500 • RFRIDDHY10 • FESTIVE1000</div>
  </div>
}
