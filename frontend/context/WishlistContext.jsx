'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Ctx=createContext(null);
export const useWishlist=()=>useContext(Ctx);
export function WishlistProvider({children}){
  const [ids,setIds]=useState([]);
  useEffect(()=>{ try{ const s=localStorage.getItem('rf_wish'); if(s) setIds(JSON.parse(s)) }catch{} },[]);
  useEffect(()=>{ try{ localStorage.setItem('rf_wish', JSON.stringify(ids)) }catch{} },[ids]);
  const toggle=(id)=> setIds(prev=> prev.includes(id)? prev.filter(x=>x!==id): [...prev,id]);
  const has=(id)=> ids.includes(id);
  return <Ctx.Provider value={{ids, toggle, has, count: ids.length}}>{children}</Ctx.Provider>
}
