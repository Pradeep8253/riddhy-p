'use client';
import { useParams } from 'next/navigation';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import '../page.css';
export default function SubCategory(){
  const { slug } = useParams();
  const products=allProducts.filter(p=> p.category===slug);
  return <div className="listing"><Breadcrumb items={[{label:'Home',href:'/'},{label:'Furniture',href:'/furniture'},{label:slug}]}/><h2 style={{margin:'12px 0'}}>{slug?.replace('-',' ')}</h2><ProductGrid products={products.length? products: allProducts.slice(0,8)}/></div>
}
