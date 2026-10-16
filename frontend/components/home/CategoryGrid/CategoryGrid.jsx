import Link from 'next/link';
import { categories } from '@/data/products';
import './CategoryGrid.css';
export default function CategoryGrid(){
  return (
    <section className="catgrid">
      <div className="catgrid__head"><div><div className="section-eyebrow">Shop by Category</div><h2>Everything your home needs</h2></div><Link href="/furniture" className="catgrid__link">View all →</Link></div>
      <div className="catgrid__grid">
        {categories.map(c=>(
          <Link key={c.slug} href={`/${c.parent}/${c.slug}`} className="catgrid__card">
            <div className="catgrid__imgWrap"><img src={c.image} alt={c.name}/><span className="catgrid__count">{c.count}+ products</span></div>
            <div className="catgrid__name">{c.name}</div>
            <div className="catgrid__parent">{c.parent}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
