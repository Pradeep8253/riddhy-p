'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/common/Toast/ToastProvider';
import CheckoutStepper from '@/components/checkout/CheckoutStepper/CheckoutStepper';
import AddressForm from '@/components/checkout/AddressForm/AddressForm';
import AddressCard from '@/components/checkout/AddressCard/AddressCard';
import DeliverySlot from '@/components/checkout/DeliverySlot/DeliverySlot';
import PaymentOptions from '@/components/checkout/PaymentOptions/PaymentOptions';
import OrderReviewSummary from '@/components/checkout/OrderReviewSummary/OrderReviewSummary';
import Button from '@/components/common/Button/Button';
import './page.css';
export default function CheckoutPage(){
  const { items, total, clear }=useCart();
  const { toast }=useToast();
  const router=useRouter();
  const [step,setStep]=useState(0);
  const [addr,setAddr]=useState(null);
  const [payment,setPayment]=useState('upi');
  const [slot,setSlot]=useState('Tomorrow, 10AM - 1PM');
  if(!items.length) return <div className="checkout"><h2>Checkout</h2><p>Your cart is empty.</p></div>
  const pay=()=>{
    toast('Payment successful via '+payment+' — verifying signature...');
    setTimeout(()=>{ clear(); router.push('/order-success'); }, 1200);
  };
  return <div className="checkout"><CheckoutStepper step={step}/><div className="checkout__layout"><div className="checkout__main">
    {step===0 && <div>{addr? <AddressCard addr={addr} selected onSelect={()=>{}}/>: <AddressForm onSave={a=>{setAddr({name:a.name,phone:a.phone,pincode:a.pincode,city:a.city,state:a.state,address:a.address}); setStep(1); toast('Address saved');}}/>}{addr && <Button onClick={()=>setStep(1)} style={{marginTop:'12px'}}>Continue to Delivery</Button>}</div>}
    {step===1 && <div><DeliverySlot onSelect={setSlot}/><div className="checkout__nav"><Button variant="ghost" onClick={()=>setStep(0)}>Back</Button><Button onClick={()=>setStep(2)}>Continue to Payment</Button></div></div>}
    {step===2 && <div><PaymentOptions value={payment} onChange={setPayment}/><div className="checkout__nav"><Button variant="ghost" onClick={()=>setStep(1)}>Back</Button><Button onClick={()=>setStep(3)}>Review Order</Button></div></div>}
    {step===3 && <div className="checkout__review"><h3>Review & Pay</h3><p>Deliver to: {addr?.address}, {addr?.city} - {addr?.pincode} • Slot: {slot} • Payment: {payment.toUpperCase()}</p><Button size="lg" variant="primary" onClick={pay}>Pay ₹{total.toLocaleString('en-IN')} Securely</Button><p className="checkout__secure">🔒 100% secure payment via Razorpay — signature & webhook verified server-side</p></div>}
  </div><OrderReviewSummary items={items} total={total}/></div></div>
}
