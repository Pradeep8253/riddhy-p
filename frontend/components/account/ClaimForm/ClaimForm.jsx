'use client';
import { useState } from 'react';
import './ClaimForm.css';
export default function ClaimForm({ onSubmit }){
  const [desc,setDesc]=useState('');
  return <form className="claim" onSubmit={e=>{e.preventDefault(); onSubmit?.({desc}); setDesc('');}}><h4>Raise a Warranty Claim</h4><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the issue (e.g., hydraulic not working, cooling issue)" rows={4} required/><input type="file" multiple accept="image/*"/><button type="submit">Submit Claim</button></form>
}
