'use client';
import { useState } from 'react';
import { useToast } from '@/components/common/Toast/ToastProvider';
import './Newsletter.css';
export default function Newsletter(){
  const [email,setEmail]=useState('');
  const { toast } = useToast();
  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <div><h3>Get ₹500 off your first order</h3><p>Join 45,000+ homes. Weekly deals, no spam.</p></div>
        <form onSubmit={e=>{e.preventDefault(); if(!email) return; toast('Welcome aboard! Check your inbox for ₹500 off.'); setEmail('');}} className="newsletter__form">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" type="email" required/>
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
