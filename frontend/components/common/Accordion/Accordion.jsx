'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Accordion.css';
export default function Accordion({ items=[] }){
  const [open,setOpen]=useState(0);
  return <div className="accordion">{items.map((it,i)=>(
    <div key={i} className={`accordion__item ${open===i?'accordion__item--open':''}`}>
      <button className="accordion__head" onClick={()=>setOpen(open===i? -1:i)} aria-expanded={open===i}><span>{it.title}</span><span className="accordion__icon">{open===i?'−':'+'}</span></button>
      <AnimatePresence initial={false}>
        {open===i && <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="accordion__body"><div className="accordion__content">{it.content}</div></motion.div>}
      </AnimatePresence>
    </div>
  ))}</div>
}
