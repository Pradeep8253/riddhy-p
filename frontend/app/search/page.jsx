'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import './page.css';
function SearchContent(){
  const q=useSearchParams().get('q')||'';
  const products=allProducts.filter(p=> p.title.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()));
  return <div className="search"><Breadcrumb items={[{label:'Home',href:'/'},{label:`Search: ${q}`}]}/><h2>Search results for “{q}” — {products.length} found</h2><ProductGrid products={products}/></div>
}
export default function SearchPage(){
  return <Suspense fallback={<div className="search">Loading...</div>}><SearchContent/></Suspense>
}
