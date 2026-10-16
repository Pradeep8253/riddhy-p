'use client';
import { useState } from 'react';
import './Testimonials.css';
const items=[
  { name:'Priya & Rohan', city:'Kanpur', text:'Our entire living room from RF Riddhy — premium finish, on-time delivery. Feels like a designer home!', rating:5 },
  { name:'Anil Kumar', city:'Lucknow', text:'The AC installation was flawless. Technician came same day, warranty activated instantly.', rating:5 },
  { name:'Sana Sheikh', city:'Delhi', text:'Love the EMI options and transparent pricing. No hidden charges.', rating:4 },
];
export default function Testimonials(){
  const [i,setI]=useState(0);
  return (
    <section className="testimonials">
      <div className="testimonials__head"><div className="section-eyebrow">Customer Love</div><h2>2,400+ homes transformed</h2></div>
      <div className="testimonials__card">
        <div className="testimonials__quote">“{items[i].text}”</div>
        <div className="testimonials__meta"><strong>{items[i].name}</strong><span>{items[i].city} • {'★'.repeat(items[i].rating)}</span></div>
        <div className="testimonials__dots">{items.map((_,idx)=> <button key={idx} onClick={()=>setI(idx)} className={`testimonials__dot ${idx===i?'testimonials__dot--active':''}`}/>)}</div>
      </div>
    </section>
  );
}
