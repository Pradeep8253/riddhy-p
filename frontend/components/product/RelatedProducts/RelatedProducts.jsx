import { allProducts } from '@/data/products';
import ProductCard from '../ProductCard/ProductCard';
import './RelatedProducts.css';
export default function RelatedProducts({ category }){
  const items=allProducts.filter(p=> p.category===category).slice(0,4);
  return <div className="related"><h3>You may also like</h3><div className="related__grid">{items.map(p=> <ProductCard key={p.slug} product={p}/>)}</div></div>
}
