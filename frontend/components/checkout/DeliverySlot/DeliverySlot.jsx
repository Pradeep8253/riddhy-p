'use client';
import { useState } from 'react';
import './DeliverySlot.css';
const slots=['Tomorrow, 10AM - 1PM','Tomorrow, 2PM - 6PM','Day after, 10AM - 1PM','Weekend, 10AM - 1PM'];
export default function DeliverySlot({ onSelect }){
  const [sel,setSel]=useState(0);
  return <div className="slot"><h4>Choose Delivery Slot</h4><div className="slot__grid">{slots.map((s,i)=> <button key={s} onClick={()=>{setSel(i); onSelect?.(s);}} className={`slot__btn ${sel===i?'slot__btn--active':''}`}>{s}</button>)}</div></div>
}
