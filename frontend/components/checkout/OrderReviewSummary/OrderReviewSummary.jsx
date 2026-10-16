import { formatCurrency } from '@/lib/formatCurrency';
import './OrderReviewSummary.css';
export default function OrderReviewSummary({ items, total }){
  return <div className="orsum"><h4>Order Summary</h4>{items.map(it=> <div key={it.sku} className="orsum__row"><img src={it.image} alt=""/><div><div>{it.title}</div><small>Qty {it.qty} • {formatCurrency(it.price)}</small></div><strong>{formatCurrency(it.price*it.qty)}</strong></div>)}<div className="orsum__total"><span>Total Payable</span><strong>{formatCurrency(total)}</strong></div></div>
}
