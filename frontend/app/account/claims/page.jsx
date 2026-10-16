import ClaimForm from '@/components/account/ClaimForm/ClaimForm';
import './page.css';
const claims=[{id:'CLM-1021',product:'LG Refrigerator',status:'Open',date:'2025-10-01'},{id:'CLM-1018',product:'Teak Dining Set',status:'Resolved',date:'2025-08-12'}];
export default function Claims(){ return <div className="claims"><h2>Claims & Service</h2><ClaimForm/><div className="claims__list">{claims.map(c=> <div key={c.id} className="claims__card"><strong>{c.id}</strong><span>{c.product} • {c.date}</span><span className={`claims__status claims__status--${c.status.toLowerCase()}`}>{c.status}</span></div>)}</div></div>}
