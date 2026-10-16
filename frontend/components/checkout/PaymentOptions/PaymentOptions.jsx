'use client';
import { useState } from 'react';
import './PaymentOptions.css';
const opts=[{id:'upi',label:'UPI (GPay/PhonePe/BHIM)',desc:'Pay via UPI ID or QR'},{id:'card',label:'Credit/Debit Card',desc:'Visa, Mastercard, Rupay'},{id:'netbanking',label:'NetBanking',desc:'All major banks'},{id:'emi',label:'EMI / No-Cost EMI',desc:'3/6/9/12 months'},{id:'cod',label:'Cash on Delivery',desc:'Available on orders below ₹50,000'}];
export default function PaymentOptions({ value, onChange }){
  const [tab,setTab]=useState(value||'upi');
  const select=(id)=>{setTab(id); onChange?.(id);};
  return <div className="pay"><div className="pay__tabs">{opts.map(o=> <button key={o.id} onClick={()=>select(o.id)} className={`pay__tab ${tab===o.id?'pay__tab--active':''}`}><strong>{o.label}</strong><span>{o.desc}</span></button>)}</div><div className="pay__panel">{tab==='upi' && <div>UPI ID: <input placeholder="yourupi@bank" style={{padding:'10px',borderRadius:'999px',border:'1px solid #ddd',width:'200px'}}/></div>}{tab==='card' && <div>Card payments securely handled by Razorpay hosted checkout.</div>}{tab==='cod' && <div>Pay with cash when your order arrives. OTP verification at delivery.</div>}{tab==='emi' && <div>No-Cost EMI on orders above ₹7,500 — shown accurately at payment.</div>}{tab==='netbanking' && <div>Select your bank at checkout.</div>}</div></div>
}
