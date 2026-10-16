import RatingStars from '@/components/common/RatingStars/RatingStars';
import { reviewsSample } from '@/data/products';
import './ReviewsSection.css';
export default function ReviewsSection({ rating=4.5, count=342 }){
  const dist=[ {s:5,p:68},{s:4,p:22},{s:3,p:6},{s:2,p:2},{s:1,p:2}];
  return <div className="reviews">
    <div className="reviews__summary"><div className="reviews__score"><strong>{rating}</strong><RatingStars rating={rating} size={14}/><span>{count} reviews</span></div><div className="reviews__bars">{dist.map(d=> <div key={d.s} className="reviews__barRow"><span>{d.s}★</span><div className="reviews__bar"><span style={{width:d.p+'%'}}/></div><span>{d.p}%</span></div>)}</div></div>
    <div className="reviews__list">{reviewsSample.map((r,i)=> <div key={i} className="reviews__item"><div className="reviews__head"><strong>{r.name}</strong>{r.verified && <span className="reviews__verified">✓ Verified Purchase</span>}<RatingStars rating={r.rating} size={12}/></div><p>{r.text}</p><small>{r.date}</small></div>)}</div>
  </div>
}
