'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';
const Ctx=createContext(null);
export const useToast=()=>useContext(Ctx);
export function ToastProvider({ children }){
  const [toasts,setToasts]=useState([]);
  const push=useCallback((msg, variant='success')=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,variant}]);
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 2800);
  },[]);
  return (
    <Ctx.Provider value={{ toast: push }}>
      {children}
      <div className="toast__stack">
        <AnimatePresence>
          {toasts.map(t=>(
            <motion.div key={t.id} initial={{opacity:0,x:40,y:-6}} animate={{opacity:1,x:0,y:0}} exit={{opacity:0,x:40}} className={`toast toast--${t.variant}`}>
              <span className="toast__dot"/><span>{t.msg}</span>
              <span className="toast__bar"/>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
export default ToastProvider;
