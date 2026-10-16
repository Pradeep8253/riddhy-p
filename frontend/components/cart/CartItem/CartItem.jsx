'use client';
import { formatCurrency } from '@/lib/formatCurrency';
import './CartItem.css';
export default function CartItem({ item, onQty, onRemove }){
  return <div className="citem">
    <img src={item.image} alt={item.title}/>
    <div className="citem__info"><div className="citem__title">{item.title}</div><div className="citem__variant">{item.variant?.label || 'Standard'}</div><div className="citem__price">{formatCurrency(item.price)} <span>{formatCurrency(item.mrp)}</span></div></div>
    <div className="citem__actions"><div className="citem__qty"><button onClick={()=>onQty(item.sku, item.qty-1)}>−</button><span>{item.qty}</span><button onClick={()=>onQty(item.sku, item.qty+1)}>+</button></div><button onClick={()=>onRemove(item.sku)} className="citem__remove">Remove</button></div>
  </div>
}
