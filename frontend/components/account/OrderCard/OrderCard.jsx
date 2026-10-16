import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import './OrderCard.css';
export default function OrderCard({ order }){
  return <Link href={`/account/orders/${order.id}`} className="ocard"><div className="ocard__head"><strong>{order.id}</strong><span className={`ocard__status ocard__status--${order.status.toLowerCase()}`}>{order.status}</span></div><div className="ocard__meta">{order.date} • {order.items.length} item(s)</div><div className="ocard__items">{order.items.slice(0,2).map(it=> <img key={it.slug} src={it.images[0]} alt=""/> )}<span>+{order.items.length}</span></div><div className="ocard__foot"><span>Total</span><strong>{formatCurrency(order.total)}</strong></div></Link>
}
