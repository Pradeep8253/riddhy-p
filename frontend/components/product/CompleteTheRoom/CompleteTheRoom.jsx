import { allProducts } from '@/data/products';
import ProductCard from '../ProductCard/ProductCard';
import './CompleteTheRoom.css';
export default function CompleteTheRoom(){
  const bundle=allProducts.slice(4,7);
  const total=bundle.reduce((s,p)=>s+p.price,0);
  return <div className="bundle"><div className="bundle__head"><h3>Complete the Room</h3><span>Bundle & save 12% • {bundle.length} items</span></div><div className="bundle__grid">{bundle.map(p=> <ProductCard key={p.slug} product={p}/>)}</div><div className="bundle__total"><strong>Bundle total: ₹{total.toLocaleString('en-IN')} </strong><span>Save ₹{Math.round(total*0.12).toLocaleString('en-IN')}</span><button>Add Bundle to Cart</button></div></div>
}
