'use client';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem/CartItem';
import CartSummary from '@/components/cart/CartSummary/CartSummary';
import CouponInput from '@/components/cart/CouponInput/CouponInput';
import EmptyCart from '@/components/cart/EmptyCart/EmptyCart';
import Link from 'next/link';
import './page.css';
export default function CartPage(){
  const { items, updateQty, remove, subtotal, mrpTotal, discount, delivery, coupon, applyCoupon, couponDiscount, total }=useCart();
  if(!items.length) return <div className="cart"><EmptyCart/></div>
  return <div className="cart"><h2>Shopping Cart — {items.length} items</h2><div className="cart__layout"><div className="cart__items">{items.map(it=> <CartItem key={it.sku} item={it} onQty={updateQty} onRemove={remove}/>)}<CouponInput onApply={applyCoupon} coupon={coupon}/></div><div className="cart__summary"><CartSummary subtotal={subtotal} mrpTotal={mrpTotal} discount={discount} delivery={delivery} coupon={coupon} couponDiscount={couponDiscount} total={total}/><Link href="/checkout" className="cart__checkout">Proceed to Checkout • ₹{total.toLocaleString('en-IN')}</Link></div></div></div>
}
