'use client';
import PriceRangeSlider from '../PriceRangeSlider/PriceRangeSlider';
import './FilterSidebar.css';
export default function FilterSidebar({ filters, setFilters, brands }){
  const toggleBrand=(b)=> setFilters(f=> ({...f, brands: f.brands.includes(b)? f.brands.filter(x=>x!==b): [...f.brands,b]}));
  return <aside className="fSidebar">
    <h3>Filters</h3>
    <div className="fSection"><strong>Price Range</strong><PriceRangeSlider min={5000} max={80000} value={filters.price} onChange={v=>setFilters(f=>({...f,price:v}))}/></div>
    <div className="fSection"><strong>Brand</strong>{(brands||['Godrej Interio','Durian','Nilkamal','LG','Samsung','Daikin','Sony','Whirlpool']).map(b=> <label key={b} className="fCheck"><input type="checkbox" checked={filters.brands.includes(b)} onChange={()=>toggleBrand(b)}/>{b}</label>)}</div>
    <div className="fSection"><strong>Customer Rating</strong>{[4,3,2].map(r=> <label key={r} className="fCheck"><input type="radio" name="rating" checked={filters.rating===r} onChange={()=>setFilters(f=>({...f,rating:r}))}/>{r}★ & above</label>)}<button className="fClear" onClick={()=>setFilters(f=>({...f,rating:0}))}>Clear rating</button></div>
    <button className="fReset" onClick={()=>setFilters({price:[5000,80000], brands:[], rating:0, sort:'popularity'})}>Clear All Filters</button>
  </aside>
}
