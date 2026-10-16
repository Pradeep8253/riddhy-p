import './TrustBadges.css';
const badges=[
  { icon:'🛡️', title:'3-Year Warranty', desc:'Manufacturer + extended cover' },
  { icon:'🚚', title:'Fast Delivery', desc:'120+ pincodes, bulky freight' },
  { icon:'🔒', title:'Secure Payments', desc:'Razorpay • UPI • EMI • COD' },
  { icon:'↩️', title:'Easy Returns', desc:'7-day returns on furniture' },
];
export default function TrustBadges(){
  return <section className="trust"><div className="trust__grid">{badges.map(b=> <div key={b.title} className="trust__card"><div className="trust__icon">{b.icon}</div><div><strong>{b.title}</strong><span>{b.desc}</span></div></div>)}</div></section>
}
