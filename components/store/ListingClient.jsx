'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ui/ProductGrid';
import { formatINR } from '@/lib/demo-data';
import Icon from '@/components/ui/Icon';
import styles from './ListingClient.module.css';
const PAGE_SIZE=12;
export default function ListingClient({ products=[], title='Explore the collection', description='Thoughtfully selected for your home.' }){
 const router=useRouter(),pathname=usePathname(),params=useSearchParams();
 const [query,setQuery]=useState(params.get('q')||''),[sort,setSort]=useState(params.get('sort')||'featured'),[maxPrice,setMaxPrice]=useState(Number(params.get('maxPrice')||0)),[brand,setBrand]=useState(params.get('brand')||''),[visible,setVisible]=useState(PAGE_SIZE),[filtersOpen,setFiltersOpen]=useState(false);
 useEffect(()=>{setQuery(params.get('q')||'');setSort(params.get('sort')||'featured');setMaxPrice(Number(params.get('maxPrice')||0));setBrand(params.get('brand')||'')},[params]);
 const brands=useMemo(()=>[...new Set(products.map((p)=>p.brand).filter(Boolean))].sort(),[products]);
 const filtered=useMemo(()=>{let list=[...products];const q=query.toLowerCase().trim();if(q)list=list.filter((p)=>[p.name,p.brand,p.categoryLabel,p.tagline,p.sku].join(' ').toLowerCase().includes(q));if(brand)list=list.filter((p)=>p.brand===brand);if(maxPrice>0)list=list.filter((p)=>p.price<=maxPrice);if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);if(sort==='rating')list.sort((a,b)=>(b.rating||0)-(a.rating||0));return list},[products,query,brand,maxPrice,sort]);
 const syncUrl=(next={})=>{const search=new URLSearchParams();const values={q:query,sort,maxPrice:maxPrice||'',brand,...next};Object.entries(values).forEach(([key,value])=>{if(value&&value!=='featured')search.set(key,String(value))});router.replace(`${pathname}${search.size?`?${search}`:''}`,{scroll:false})};
 const setQueryAndSync=(value)=>{setQuery(value);setVisible(PAGE_SIZE);window.clearTimeout(window.__rfSearchTimer);window.__rfSearchTimer=window.setTimeout(()=>{const search=new URLSearchParams(window.location.search);value?search.set('q',value):search.delete('q');router.replace(`${pathname}${search.size?`?${search}`:''}`,{scroll:false})},240)};
 const clear=()=>{setQuery('');setSort('featured');setMaxPrice(0);setBrand('');setVisible(PAGE_SIZE);router.replace(pathname,{scroll:false})};
 return <div className={styles.layout}>
  <aside className={`${styles.sidebar} ${filtersOpen?styles.show:''}`}><div className={styles.filterTop}><b>Refine your search</b><button type="button" onClick={clear}>Clear all</button></div>
   <label className={styles.field}>Search in this collection<input value={query} onChange={(e)=>setQueryAndSync(e.target.value)} placeholder="Try ‘sage sofa’"/></label>
   <label className={styles.field}>Brand<select value={brand} onChange={(e)=>{setBrand(e.target.value);setVisible(PAGE_SIZE);syncUrl({brand:e.target.value})}}><option value="">All brands</option>{brands.map((name)=><option key={name}>{name}</option>)}</select></label>
   <label className={styles.field}>Price up to <strong>{maxPrice?formatINR(maxPrice):'Any price'}</strong><input type="range" min="0" max="150000" step="5000" value={maxPrice} onChange={(e)=>{const value=Number(e.target.value);setMaxPrice(value);setVisible(PAGE_SIZE);syncUrl({maxPrice:value})}}/><span className={styles.rangeEnds}><span>Any</span><span>₹1,50,000</span></span></label>
    <div className={styles.checks}>
      <b>Shop with confidence</b>
      <span><Icon name="check" size={13} /> Demo items have sample stock</span>
      <span><Icon name="check" size={13} /> Dimensions shown per product</span>
      <span><Icon name="check" size={13} /> Service options by pincode</span>
    </div>
  </aside>
  <div className={styles.results}><div className={styles.toolbar}><button type="button" className={styles.mobileFilter} onClick={()=>setFiltersOpen(!filtersOpen)}>{filtersOpen?'Close filters':'Filters & sort'}</button><span>{filtered.length} thoughtfully chosen finds</span><label>Sort by <select value={sort} onChange={(e)=>{setSort(e.target.value);setVisible(PAGE_SIZE);syncUrl({sort:e.target.value})}}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Customer rating</option></select></label></div>
   {(query||brand||maxPrice>0)&&<div className={styles.chips}>{query&&<button onClick={()=>setQueryAndSync('')}>“{query}” <Icon name="close" size={12} /></button>}{brand&&<button onClick={()=>{setBrand('');syncUrl({brand:''})}}>{brand} <Icon name="close" size={12} /></button>}{maxPrice>0&&<button onClick={()=>{setMaxPrice(0);syncUrl({maxPrice:''})}}>Up to {formatINR(maxPrice)} <Icon name="close" size={12} /></button>}</div>}
   {filtered.length?<><ProductGrid products={filtered.slice(0,visible)}/>{visible<filtered.length&&<button className={styles.more} onClick={()=>setVisible((v)=>v+PAGE_SIZE)} type="button">Show more products <Icon name="arrowDown" size={14} /></button>}</>:<div className={styles.empty}><h3>No exact matches just yet.</h3><p>Try a broader search or clear one of the filters.</p><button onClick={clear} type="button">Clear filters</button></div>}
  </div>
 </div>;
}
