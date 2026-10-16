import Link from 'next/link';
import './EmptyCart.css';
export default function EmptyCart(){ return <div className="empty"><div className="empty__icon">🛒</div><h3>Your cart is empty</h3><p>Looks like you haven't added anything yet. Explore our furniture & appliances.</p><Link href="/furniture" className="empty__cta">Start Shopping</Link></div> }
