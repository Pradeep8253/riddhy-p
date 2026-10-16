'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export function useCart(){ return useContext(CartContext); }

export function CartProvider({ children }){
  const [items,setItems]=useState([]);
  const [coupon,setCoupon]=useState(null);

  useEffect(()=>{
    try{ const s=localStorage.getItem('rf_cart'); if(s) setItems(JSON.parse(s)); const c=localStorage.getItem('rf_coupon'); if(c) setCoupon(JSON.parse(c)); }catch{}
  },[]);
  useEffect(()=>{ try{ localStorage.setItem('rf_cart', JSON.stringify(items)) }catch{} },[items]);
  useEffect(()=>{ try{ coupon? localStorage.setItem('rf_coupon', JSON.stringify(coupon)): localStorage.removeItem('rf_coupon') }catch{} },[coupon]);

  const add = (product, variant, qty=1)=>{
    const sku = variant ? `${product.slug}--${variant.sku}` : product.slug;
    setItems(prev=>{
      const idx=prev.findIndex(p=>p.sku===sku);
      if(idx>=0){ const n=[...prev]; n[idx]={...n[idx], qty:n[idx].qty+qty}; return n; }
      return [...prev,{ id: sku, sku, product, variant, qty, price: variant?.price ?? product.price, mrp: variant?.mrp ?? product.mrp, title: product.title, image: variant?.image || product.images[0] }];
    });
  };
  const updateQty=(sku, qty)=>{
    if(qty<=0) return remove(sku);
    setItems(prev=>prev.map(p=>p.sku===sku? {...p,qty}:p));
  };
  const remove=(sku)=> setItems(prev=>prev.filter(p=>p.sku!==sku));
  const clear=()=>{ setItems([]); setCoupon(null); };

  const subtotal = useMemo(()=> items.reduce((s,i)=> s + i.price*i.qty,0),[items]);
  const mrpTotal = useMemo(()=> items.reduce((s,i)=> s + i.mrp*i.qty,0),[items]);
  const discount = mrpTotal - subtotal;
  const delivery = subtotal > 15000 || items.length===0 ? 0 : 199;
  const couponDiscount = coupon ? Math.min(coupon.value, subtotal*0.2) : 0;
  const total = Math.max(0, subtotal - couponDiscount + delivery);
  const count = items.reduce((s,i)=> s + i.qty,0);

  const applyCoupon = (code)=>{
    const map={ 'WELCOME500':{code:'WELCOME500',value:500}, 'RFRIDDHY10':{code:'RFRIDDHY10',value:800}, 'FESTIVE1000':{code:'FESTIVE1000',value:1000}};
    if(map[code?.toUpperCase()]){ setCoupon(map[code.toUpperCase()]); return {ok:true, ...map[code.toUpperCase()]} }
    return {ok:false, message:'Invalid coupon code'};
  };

  return <CartContext.Provider value={{items, add, updateQty, remove, clear, subtotal, mrpTotal, discount, delivery, coupon, applyCoupon, couponDiscount, total, count}}>{children}</CartContext.Provider>
}
