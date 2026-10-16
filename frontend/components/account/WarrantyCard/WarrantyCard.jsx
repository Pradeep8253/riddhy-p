import './WarrantyCard.css';
export default function WarrantyCard({ record }){
  const { product, daysRemaining, totalDays, status } = record;
  const pct = daysRemaining!=null && totalDays? Math.max(0, Math.min(100, (daysRemaining/totalDays)*100)) : 0;
  const dash = 2*Math.PI*44;
  const offset = dash - (dash*pct/100);
  const color = status==='Active'? 'var(--success)' : status==='Expiring Soon'? 'var(--warning)' : status==='Expired'? 'var(--error)' : '#9CA3AF';
  const icon = status==='Active'? '✓' : status==='Expiring Soon'? '⚠' : status==='Expired'? '✕' : '◷';
  return <div className="wcard">
    <img src={product.images[0]} alt={product.title} className="wcard__img"/>
    <div className="wcard__info"><div className="wcard__title">{product.title}</div><div className="wcard__meta">Purchased {record.purchaseDate} • {status==='Pending Activation'? 'Awaiting delivery/installation': `Expires ${record.expiry}`}</div><div className="wcard__status" style={{color}}><span className="wcard__icon">{icon}</span>{status}</div><div className="wcard__actions"><button>Raise Claim</button>{daysRemaining!==null && daysRemaining<=30 && status==='Active' && <button className="wcard__extend">Extend Warranty</button>}</div></div>
    <div className="wcard__ring">
      <svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" stroke="#eee" strokeWidth="8" fill="none"/><circle cx="50" cy="50" r="44" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%', transition:'stroke-dashoffset 1s var(--ease)'}}/></svg>
      <div className="wcard__center"><strong>{daysRemaining!=null? daysRemaining:'—'}</strong><small>days left</small></div>
    </div>
  </div>
}
