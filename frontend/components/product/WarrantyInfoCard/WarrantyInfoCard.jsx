import './WarrantyInfoCard.css';
export default function WarrantyInfoCard({ warrantyDays=365 }){
  const years = (warrantyDays/365).toFixed(1);
  return <div className="warranty"><div className="warranty__icon">🛡️</div><div><strong>{years} Year Warranty</strong><p>Manufacturer warranty • Free service visits • Genuine parts. Activation on delivery/installation sign-off. Retain invoice for claims.</p><span className="warranty__badge">✓ Extended warranty available at checkout</span></div></div>
}
