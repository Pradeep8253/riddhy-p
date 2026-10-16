'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './SidebarNav.css';
const links=[{href:'/account/profile',label:'Profile'},{href:'/account/orders',label:'My Orders'},{href:'/account/warranty',label:'Warranty'},{href:'/account/my-products',label:'My Products'},{href:'/account/claims',label:'Claims'},{href:'/account/addresses',label:'Addresses'},{href:'/account/invoices',label:'Invoices'}];
export default function SidebarNav(){
  const path=usePathname();
  return <nav className="aside"><div className="aside__user"><span className="aside__avatar">RS</span><span><strong>Rahul Sharma</strong><small>rahul@example.com</small></span></div>{links.map(l=> <Link key={l.href} href={l.href} className={`aside__link ${path===l.href?'aside__link--active':''}`}>{l.label}</Link>)}<Link href="/login" className="aside__logout">Logout</Link></nav>
}
