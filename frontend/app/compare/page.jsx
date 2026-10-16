'use client';
import { useCompare } from '@/context/CompareContext';
import { formatCurrency } from '@/lib/formatCurrency';
import Link from 'next/link';
import './page.css';
export default function ComparePage(){
  const { items, remove, clear }=useCompare();
  if(!items.length) return <div className="compare"><h2>Compare Products</h2><p>Add up to 4 products to compare.</p><Link href="/furniture" className="compare__cta">Browse Furniture</Link></div>
  const specsKeys=[...new Set(items.flatMap(p=> Object.keys(p.specs||{})))];
  return <div className="compare"><div className="compare__head"><h2>Compare ({items.length}/4)</h2><button onClick={clear}>Clear All</button></div><div className="compare__table"><div className="compare__row compare__row--head"><div>Product</div>{items.map(p=> <div key={p.slug} className="compare__cell"><img src={p.images[0]} alt=""/><strong>{p.title}</strong><span>{p.brand}</span><strong>{formatCurrency(p.price)}</strong><button onClick={()=>remove(p.slug)}>Remove</button></div>)}</div>{specsKeys.map(k=> <div key={k} className="compare__row"><div>{k}</div>{items.map(p=> <div key={p.slug} className="compare__cell">{p.specs[k]||'—'}</div>)}</div>)}</div></div>
}
