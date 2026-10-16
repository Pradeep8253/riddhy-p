import './RatingStars.css';
export default function RatingStars({ rating=4.5, count, size=14 }){
  const stars=[1,2,3,4,5];
  return (
    <div className="rating">
      <div className="rating__stars">
        {stars.map(s=>{
          const fill = Math.max(0, Math.min(1, rating - (s-1)));
          return <span key={s} className="rating__star" style={{fontSize:size}}><span className="rating__starBg">★</span><span className="rating__starFill" style={{width:`${fill*100}%`}}>★</span></span>
        })}
      </div>
      {count!=null && <span className="rating__count">({count.toLocaleString('en-IN')})</span>}
      <span className="rating__value">{rating.toFixed(1)}</span>
    </div>
  );
}
