import { allProducts } from '@/data/products';
import PriceBlock from '@/components/product/PriceBlock/PriceBlock';
import './ApplianceDeals.css';
export default function ApplianceDeals(){
  const items = allProducts.filter(p=> ['refrigerators','air-conditioners','televisions'].includes(p.category)).slice(0,3);
  return (
    <section className="appdeals">
      <div className="appdeals__head"><div><div className="section-eyebrow">Spec-Forward</div><h2>Appliance Deals</h2></div><a href="/appliances" className="appdeals__link">Compare specs →</a></div>
      <div className="appdeals__grid">
        {items.map(p=>(
          <div key={p.slug} className="appdeals__card">
            <img src={p.images[0]} alt={p.title}/>
            <div className="appdeals__info"><div className="appdeals__brand">{p.brand}</div><h3>{p.title}</h3><div className="appdeals__specs">{Object.entries(p.specs).slice(0,3).map(([k,v])=> <span key={k}><strong>{k}:</strong> {v}</span>)}</div><PriceBlock price={p.price} mrp={p.mrp}/></div>
          </div>
        ))}
      </div>
    </section>
  );
}
