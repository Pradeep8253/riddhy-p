'use client';
import { useState, useMemo } from 'react';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import FilterSidebar from '@/components/filters/FilterSidebar/FilterSidebar';
import SortDropdown from '@/components/filters/SortDropdown/SortDropdown';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import './page.css';
export default function AppliancesListing(){
  const [filters,setFilters]=useState({price:[5000,80000], brands:[], rating:0, sort:'popularity'});
  const filtered=useMemo(()=>{
    let r=allProducts.filter(p=> ['refrigerators','washing-machines','air-conditioners','televisions','microwaves','air-coolers'].includes(p.category));
    r=r.filter(p=> p.price>=filters.price[0] && p.price<=filters.price[1]);
    if(filters.brands.length) r=r.filter(p=> filters.brands.includes(p.brand));
    if(filters.sort==='price_low') r=[...r].sort((a,b)=>a.price-b.price);
    if(filters.sort==='price_high') r=[...r].sort((a,b)=>b.price-a.price);
    return r;
  },[filters]);
  return <div className="listing"><div className="listing__top"><Breadcrumb items={[{label:'Home',href:'/'},{label:'Appliances'}]}/><div className="listing__meta"><span>{filtered.length} products</span><SortDropdown value={filters.sort} onChange={v=>setFilters(f=>({...f,sort:v}))}/></div></div><div className="listing__layout"><FilterSidebar filters={filters} setFilters={setFilters}/><ProductGrid products={filtered}/></div></div>
}
