import { brands } from '@/data/products';
import './BrandStrip.css';
export default function BrandStrip(){
  return (
    <section className="brandstrip">
      <div className="brandstrip__label">Trusted Brands</div>
      <div className="brandstrip__marquee">
        <div className="brandstrip__track">
          {[...brands,...brands].map((b,i)=><span key={i} className="brandstrip__brand">{b.logo}</span>)}
        </div>
      </div>
    </section>
  );
}
