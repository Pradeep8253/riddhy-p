'use client';
import Link from 'next/link';
import { useState } from 'react';
import './CategoryNav.css';
const nav = [
  { label:'Furniture', href:'/furniture', mega:[
    { title:'Living', links:['Sofas','Recliners','Coffee Tables','TV Units']},
    { title:'Bedroom', links:['Beds','Wardrobes','Mattresses','Dressers']},
    { title:'Dining', links:['Dining Sets','Chairs','Buffets']},
    { title:'Office', links:['Office Chairs','Desks','Storage']},
  ]},
  { label:'Appliances', href:'/appliances', mega:[
    { title:'Kitchen', links:['Refrigerators','Microwaves','Dishwashers']},
    { title:'Climate', links:['Air Conditioners','Air Coolers','Air Purifiers']},
    { title:'Laundry', links:['Washing Machines','Dryers']},
    { title:'Entertainment', links:['Televisions','Soundbars']},
  ]},
  { label:'Best Sellers', href:'/furniture' },
  { label:'New Arrivals', href:'/appliances' },
  { label:'Offers', href:'/search?q=offer', badge:'Up to 60% off' },
  { label:'B2B / Bulk', href:'/b2b' },
];
export default function CategoryNav(){
  const [open,setOpen]=useState(null);
  return (
    <nav className="catnav" onMouseLeave={()=>setOpen(null)}>
      <div className="catnav__inner">
        {nav.map((n,i)=>(
          <div key={i} className="catnav__item" onMouseEnter={()=> n.mega && setOpen(i)}>
            <Link href={n.href} className="catnav__link">{n.label} {n.badge && <span className="catnav__badge">{n.badge}</span>}</Link>
            {n.mega && open===i && (
              <div className="catnav__mega">
                {n.mega.map((col,ci)=>(
                  <div key={ci} className="catnav__col">
                    <div className="catnav__colTitle">{col.title}</div>
                    {col.links.map(l=> <Link key={l} href={`/${n.label.toLowerCase()}/${l.toLowerCase().replace(/\s+/g,'-')}`} className="catnav__megaLink">{l}</Link>)}
                  </div>
                ))}
                <div className="catnav__promo"><div className="catnav__promoCard"><strong>Free Installation</strong><span>On all furniture</span></div></div>
              </div>
            )}
          </div>
        ))}
        <div className="catnav__right"><span>📞 1800-123-7799</span><span className="catnav__dot">•</span><Link href="/help/contact">Need help?</Link></div>
      </div>
    </nav>
  );
}
