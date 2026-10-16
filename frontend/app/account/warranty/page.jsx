import { warrantyRecords } from '@/data/products';
import WarrantyCard from '@/components/account/WarrantyCard/WarrantyCard';
import './page.css';
export default function WarrantyPage(){
  return <div className="warrantyPage"><h2>Warranty Dashboard</h2><p>Track coverage • Days remaining updates server-side daily • Activation on delivery/installation sign-off</p><div className="warrantyPage__list">{warrantyRecords.map(r=> <WarrantyCard key={r.id} record={r}/>)}</div></div>
}
