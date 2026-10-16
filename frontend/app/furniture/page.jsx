'use client';
import { useState, useMemo } from 'react';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import FilterSidebar from '@/components/filters/FilterSidebar/FilterSidebar';
import FilterChip from '@/components/filters/FilterChip/FilterChip';
import SortDropdown from '@/components/filters/SortDropdown/SortDropdown';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import MobileFilterSheet from '@/components/filters/MobileFilterSheet/MobileFilterSheet';
import './page.css';
export default function FurnitureListing(){
  const [filters,setFilters]=useState({price:[5000,80000], brands:[], rating:0, sort:'popularity'});
  const [mobile,setMobile]=useState(false);
  const filtered=useMemo(()=>{
    let r=allProducts.filter(p=> ['sofas','beds','dining','wardrobes','office','chairs'].includes(p.category));
    r=r.filter(p=> p.price>=filters.price[0] && p.price<=filters.price[1]);
    if(filters.brands.length) r=r.filter(p=> filters.brands.includes(p.brand));
    if(filters.rating) r=r.filter(p=> p.rating>=filters.rating);
    if(filters.sort==='price_low') r=[...r].sort((a,b)=>a.price-b.price);
    if(filters.sort==='price_high') r=[...r].sort((a,b)=>b.price-a.price);
    if(filters.sort==='rating') r=[...r].sort((a,b)=>b.rating-a.rating);
    if(filters.sort==='discount') r=[...r].sort((a,b)=> (b.mrp-b.price)-(a.mrp-a.price));
    return r;
  },[filters]);
  return <div className="listing">
    <div className="listing__top"><Breadcrumb items={[{label:'Home',href:'/'},{label:'Furniture'}]}/><div className="listing__meta"><span>{filtered.length} products</span><SortDropdown value={filters.sort} onChange={v=>setFilters(f=>({...f,sort:v}))}/><button className="listing__filterBtn" onClick={()=>setMobile(true)}>Filters</button></div></div>
    {(filters.brands.length>0||filters.rating) && <div className="listing__chips">{filters.brands.map(b=> <FilterChip key={b} label={b} onRemove={()=>setFilters(f=>({...f,brands:f.brands.filter(x=>x!==b)}))}/> )}{filters.rating? <FilterChip label={`${filters.rating}★ & above`} onRemove={()=>setFilters(f=>({...f,rating:0}))}/>:null}</div>}
    <div className="listing__layout"><div className="listing__sidebar"><FilterSidebar filters={filters} setFilters={setFilters}/></div><ProductGrid products={filtered}/></div>
    <MobileFilterSheet open={mobile} onClose={()=>setMobile(false)}><FilterSidebar filters={filters} setFilters={setFilters}/></MobileFilterSheet>
  </div>
}
