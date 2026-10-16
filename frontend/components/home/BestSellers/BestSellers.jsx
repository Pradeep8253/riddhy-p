'use client';
import { useState } from 'react';
import { allProducts } from '@/data/products';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import './BestSellers.css';
const tabs=['All','Furniture','Appliances'];
export default function BestSellers(){
  const [active,setActive]=useState('All');
  const filtered = allProducts.filter(p=> active==='All' || (active==='Furniture' && ['sofas','beds','dining','wardrobes','office','chairs'].includes(p.category)) || (active==='Appliances' && ['refrigerators','washing-machines','air-conditioners','televisions','microwaves','air-coolers'].includes(p.category)) ).slice(0,8);
  return (
    <section className="bestsellers">
      <div className="bestsellers__head"><h2>Best Sellers</h2><div className="bestsellers__tabs">{tabs.map(t=> <button key={t} onClick={()=>setActive(t)} className={`bestsellers__tab ${active===t?'bestsellers__tab--active':''}`}>{t}</button>)}</div></div>
      <div className="bestsellers__grid">{filtered.map(p=> <ProductCard key={p.slug} product={p}/>)}</div>
    </section>
  );
}
