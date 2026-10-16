'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from '@/hooks/useLenis';
import './Modal.css';
export default function Modal({ open, onClose, children, title }){
  const lenis=useLenis();
  useEffect(()=>{
    if(open) lenis?.stop(); else lenis?.start();
    return ()=> lenis?.start();
  },[open, lenis]);
  return (
    <AnimatePresence>
      {open && <>
        <motion.div className="modal__backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
        <motion.div className="modal" initial={{opacity:0, y:20, scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10, scale:0.98}} transition={{duration:0.3, ease:[0.16,1,0.3,1]}}>
          <div className="modal__head">
            <h3 className="modal__title">{title}</h3>
            <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="modal__body">{children}</div>
        </motion.div>
      </>}
    </AnimatePresence>
  );
}
