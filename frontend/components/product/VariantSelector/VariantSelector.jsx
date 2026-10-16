'use client';
import './VariantSelector.css';
export default function VariantSelector({ variants=[], selected, onSelect }){
  if(!variants?.length) return null;
  return (
    <div className="variant">
      <div className="variant__label">Available Variants</div>
      <div className="variant__list">
        {variants.map(v=>(
          <button key={v.sku} onClick={()=>onSelect(v)} className={`variant__chip ${selected?.sku===v.sku?'variant__chip--active':''} ${v.stock===0?'variant__chip--oos':''}`} disabled={v.stock===0}>
            <span className="variant__swatch" style={{background:v.color || '#eee'}}/>
            <span className="variant__text"><strong>{v.label}</strong><small>{v.stock>0? `${v.stock} in stock`:'Out of stock'} • ₹{v.price.toLocaleString('en-IN')}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}
