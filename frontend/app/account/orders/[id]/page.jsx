'use client';
import { useParams } from 'next/navigation';
import { sampleOrders } from '@/data/products';
import OrderTimeline from '@/components/account/OrderTimeline/OrderTimeline';
import { formatCurrency } from '@/lib/formatCurrency';
import './page.css';
export default function OrderDetail(){
  const { id } = useParams();
  const order=sampleOrders.find(o=>o.id===decodeURIComponent(id)) || sampleOrders[0];
  const steps=['Paid/Confirmed','Processing','Quality Check','Ready to Dispatch','Shipped','Out for Delivery','Delivered'];
  const current= steps.indexOf(order.status);
  return <div className="odetail"><h2>Order {order.id}</h2><OrderTimeline steps={steps} current={current>=0? current:4}/><div className="odetail__card">{order.items.map(it=> <div key={it.slug} className="odetail__item"><img src={it.images[0]} alt=""/><div><strong>{it.title}</strong><span>{formatCurrency(it.price)} × 1</span></div></div>)}<div className="odetail__total"><span>Total Paid</span><strong>{formatCurrency(order.total)}</strong></div><button>Download Invoice (GST)</button><button className="secondary">Cancel / Return</button></div></div>
}
