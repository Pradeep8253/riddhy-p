import Link from 'next/link';
import './page.css';
export default function OrderSuccess(){
  const id='RF-'+new Date().getFullYear()+'-'+Math.floor(10000+Math.random()*90000);
  return <div className="success"><div className="success__card"><div className="success__icon">✓</div><h1>Order Confirmed!</h1><p>Your order <strong>{id}</strong> has been placed and payment verified.</p><div className="success__meta">Expect delivery in 3-5 days • Invoice sent to email • Warranty will activate on installation sign-off</div><div className="success__actions"><Link href="/account/orders">View Orders</Link><Link href="/furniture" className="primary">Continue Shopping</Link></div></div></div>
}
