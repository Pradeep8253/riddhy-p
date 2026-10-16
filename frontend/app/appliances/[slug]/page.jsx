'use client';
import { useParams } from 'next/navigation';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
export default function Sub(){ const {slug}=useParams(); const products=allProducts.filter(p=>p.category===slug); return <div style={{maxWidth:'1280px',margin:'0 auto',padding:'18px 20px'}}><Breadcrumb items={[{label:'Home',href:'/'},{label:'Appliances',href:'/appliances'},{label:slug}]}/><h2 style={{margin:'12px 0'}}>{slug}</h2><ProductGrid products={products.length?products:allProducts.slice(6,14)}/></div> }
