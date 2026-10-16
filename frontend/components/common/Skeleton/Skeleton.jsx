import './Skeleton.css';
export default function Skeleton({ w='100%', h=16, r=8, count=1, className='' }){
  return <div className={`skeleton__group ${className}`}>{Array.from({length:count}).map((_,i)=><div key={i} className="skeleton" style={{width:w,height:h,borderRadius:r}}/>)}</div>
}
export function ProductCardSkeleton(){
  return <div className="skeleton-card"><div className="skeleton skeleton--img"/><div className="skeleton" style={{height:14,width:'80%'}}/><div className="skeleton" style={{height:12,width:'50%'}}/><div className="skeleton" style={{height:18,width:'40%'}}/></div>
}
