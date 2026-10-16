'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import './MobileBottomNav.css';
const items=[
  { href:'/', label:'Home', icon:'⌂' },
  { href:'/furniture', label:'Categories', icon:'▦' },
  { href:'/cart', label:'Cart', icon:'🛒' },
  { href:'/wishlist', label:'Wishlist', icon:'♡' },
  { href:'/account', label:'Account', icon:'👤' },
];
export default function MobileBottomNav(){
  const path=usePathname();
  const { count } = useCart();
  return (
    <nav className="mnav">
      {items.map(it=>{
        const active = path===it.href;
        return <Link key={it.href} href={it.href} className={`mnav__item ${active?'mnav__item--active':''}`}><span className="mnav__icon">{it.icon}{it.label==='Cart'&& count>0 && <span className="mnav__badge">{count}</span>}</span><span className="mnav__label">{it.label}</span></Link>
      })}
    </nav>
  );
}
