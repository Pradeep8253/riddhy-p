import ProductCard from '../ProductCard/ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import './ProductGrid.css';
export default function ProductGrid({ products=[], loading=false }){
  if(loading) return <div className="pgrid">{Array.from({length:8}).map((_,i)=> <ProductCardSkeleton key={i}/>)}</div>
  if(!products.length) return <div className="pgrid__empty">No products found. Try adjusting filters.</div>
  return <div className="pgrid">{products.map(p=> <ProductCard key={p.slug} product={p}/>)}</div>
}
