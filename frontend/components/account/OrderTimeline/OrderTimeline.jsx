'use client';
import { motion } from 'framer-motion';
import './OrderTimeline.css';
export default function OrderTimeline({ steps=[], current=0 }){
  return <div className="timeline"><div className="timeline__track"><motion.div className="timeline__progress" initial={{scaleX:0}} animate={{scaleX: (current+1)/steps.length}} transition={{duration:0.8, ease:[0.16,1,0.3,1]}} style={{originX:0}}/></div><div className="timeline__steps">{steps.map((s,i)=> <div key={s} className={`timeline__step ${i<=current?'timeline__step--active':''}`}><span className="timeline__dot">{i<=current?'✓':''}</span><span>{s}</span></div>)}</div></div>
}
