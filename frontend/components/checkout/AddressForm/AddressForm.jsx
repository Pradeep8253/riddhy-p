'use client';
import { useState } from 'react';
import './AddressForm.css';
export default function AddressForm({ onSave }){
  const [form,setForm]=useState({name:'',phone:'',pincode:'',address:'',city:'',state:''});
  return <form className="aform" onSubmit={e=>{e.preventDefault(); onSave(form);}}>
    <div className="aform__grid"><input placeholder="Full Name*" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input placeholder="Phone*" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
    <div className="aform__grid"><input placeholder="Pincode*" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} required/><input placeholder="City*" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></div>
    <input placeholder="State*" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} required/>
    <textarea placeholder="House no, Street, Landmark*" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required rows={3}/>
    <button type="submit">Save & Continue</button>
  </form>
}
