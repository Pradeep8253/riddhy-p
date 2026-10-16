'use client';
import { useState } from 'react';
import './DeliveryPincodeChecker.css';
export default function DeliveryPincodeChecker(){
  const [pin,setPin]=useState('');
  const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);
  const check=()=>{
    if(pin.length!==6) return setRes({ok:false, msg:'Enter valid 6-digit pincode'});
    setLoading(true);
    setTimeout(()=>{ setLoading(false); const ok = ['208001','208002','110001','400001','560001'].includes(pin) || pin.startsWith('2'); setRes(ok? {ok:true, msg:`✓ Delivery available • Free installation • Delivery in 3-5 days`} : {ok:false, msg:'✕ Not serviceable. Nearest service at 208001 (Kanpur).'})},700);
  };
  return <div className="pincode">
    <div className="pincode__label">Delivery & Serviceability</div>
    <div className="pincode__row"><input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter pincode (e.g. 208001)" inputMode="numeric"/><button onClick={check} disabled={loading}>{loading?'Checking...':'Check'}</button></div>
    {res && <div className={`pincode__res ${res.ok?'pincode__res--ok':'pincode__res--err'}`}>{res.msg}</div>}
  </div>
}
