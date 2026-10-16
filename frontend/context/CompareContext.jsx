'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Ctx=createContext(null);
export const useCompare=()=>useContext(Ctx);
export function CompareProvider({children}){
  const [items,setItems]=useState([]);
  useEffect(()=>{ try{ const s=localStorage.getItem('rf_compare'); if(s) setItems(JSON.parse(s)) }catch{} },[]);
  useEffect(()=>{ try{ localStorage.setItem('rf_compare', JSON.stringify(items)) }catch{} },[items]);
  const add=(p)=>{
    if(items.find(x=>x.slug===p.slug)) return {ok:false, msg:'Already in compare'};
    if(items.length>=4) return {ok:false, msg:'Compare up to 4 products only'};
    setItems(prev=>[...prev,p]); return {ok:true};
  };
  const remove=(slug)=> setItems(prev=>prev.filter(p=>p.slug!==slug));
  const clear=()=> setItems([]);
  const has=(slug)=> items.some(p=>p.slug===slug);
  return <Ctx.Provider value={{items, add, remove, clear, has, count: items.length}}>{children}</Ctx.Provider>
}
