'use client';
import { formatCurrency } from '@/lib/formatCurrency';
import Button from '@/components/common/Button/Button';
import './StickyBuyBar.css';
export default function StickyBuyBar({ product, variant, onAdd, onBuy }){
  const price=variant?.price ?? product.price;
  return <div className="buybar"><div className="buybar__inner"><img src={variant?.image || product.images[0]} alt=""/><div className="buybar__info"><strong>{product.title}</strong><span>{formatCurrency(price)} {variant? `• ${variant.label}`:''}</span></div><div className="buybar__actions"><Button variant="outline" onClick={onAdd}>Add to Cart</Button><Button variant="primary" onClick={onBuy}>Buy Now</Button></div></div></div>
}
