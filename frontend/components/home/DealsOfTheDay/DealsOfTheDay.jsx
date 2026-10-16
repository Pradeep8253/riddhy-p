'use client';
import { allProducts } from '@/data/products';
import CountdownTimer from '@/components/common/CountdownTimer/CountdownTimer';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import './DealsOfTheDay.css';
export default function DealsOfTheDay(){
  const deals = allProducts.slice(0,6);
  const deadline = new Date(Date.now()+ 1000*60*60*7).toISOString();
  return (
    <section className="deals">
      <div className="deals__head">
        <div><div className="section-eyebrow">Limited Time</div><h2>Deals of the Day</h2></div>
        <div className="deals__timer"><span>Ends in</span><CountdownTimer deadline={deadline}/></div>
      </div>
      <div className="deals__scroll">
        {deals.map(p=> <div key={p.slug} className="deals__card"><ProductCard product={p}/></div>)}
      </div>
    </section>
  );
}
