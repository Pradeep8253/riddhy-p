'use client';

import { Provider } from 'react-redux';
import { useEffect,useRef } from 'react';
import { makeStore } from '@/store/store';
export default function StoreProvider({children}){
  const storeRef=useRef(null);if(!storeRef.current)storeRef.current=makeStore();
  useEffect(()=>{
    const store=storeRef.current;
    try{
      const saved=window.localStorage.getItem('rf-riddhy-state');
      if(window.localStorage.getItem('rf-lite-mode')==='1')store.dispatch({type:'ui/setLiteMode',payload:true});
      if(saved){const state=JSON.parse(saved);if(state.cart)store.dispatch({type:'cart/rehydrate',payload:state.cart});if(state.wishlist)store.dispatch({type:'wishlist/rehydrate',payload:state.wishlist});if(state.compare)store.dispatch({type:'compare/rehydrate',payload:state.compare})}
    }catch{window.localStorage.removeItem('rf-riddhy-state')}
    const unsubscribe=store.subscribe(()=>{try{const state=store.getState();window.localStorage.setItem('rf-riddhy-state',JSON.stringify({cart:state.cart,wishlist:state.wishlist,compare:state.compare}))}catch{}});
    return unsubscribe;
  },[]);
  return <Provider store={storeRef.current}>{children}</Provider>
}
