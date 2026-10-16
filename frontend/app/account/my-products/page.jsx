import { warrantyRecords } from '@/data/products';
import './page.css';
export default function MyProducts(){ return <div className="myprod"><h2>My Products</h2><div className="myprod__list">{warrantyRecords.map(r=> <div key={r.id} className="myprod__card"><img src={r.product.images[0]} alt=""/><div><strong>{r.product.title}</strong><small>Serial: SR-{r.id.toUpperCase()}-****-{Math.floor(1000+Math.random()*9000)}</small><span>Purchased {r.purchaseDate} • Invoice RF-INV-{r.id}</span></div><span className="myprod__status">{r.status}</span></div>)}</div></div>}
