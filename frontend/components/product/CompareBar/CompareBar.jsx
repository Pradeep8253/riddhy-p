'use client';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';
import './CompareBar.css';
export default function CompareBar(){
  const { items, remove, clear } = useCompare();
  if(items.length<1) return null;
  return <div className="comparebar"><div className="comparebar__inner"><span className="comparebar__label">Compare ({items.length}/4)</span><div className="comparebar__items">{items.map(p=> <span key={p.slug} className="comparebar__chip">{p.title.slice(0,18)}... <button onClick={()=>remove(p.slug)}>✕</button></span>)}</div><div className="comparebar__actions"><button onClick={clear} className="comparebar__clear">Clear</button><Link href="/compare" className="comparebar__cta">Compare →</Link></div></div></div>
}
