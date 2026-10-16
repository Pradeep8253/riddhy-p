'use client';
import Link from 'next/link';
import './MobileDrawer.css';
export default function MobileDrawer({ open, onClose }){
  if(!open) return null;
  return (
    <div className="drawer">
      <div className="drawer__backdrop" onClick={onClose}/>
      <div className="drawer__panel">
        <div className="drawer__head"><strong>RF Riddhy</strong><button onClick={onClose}>✕</button></div>
        <nav className="drawer__nav">
          <Link href="/furniture" onClick={onClose}>Furniture</Link>
          <Link href="/appliances" onClick={onClose}>Appliances</Link>
          <Link href="/compare" onClick={onClose}>Compare</Link>
          <Link href="/help/faq" onClick={onClose}>Help & Support</Link>
          <Link href="/b2b" onClick={onClose}>B2B Bulk Enquiry</Link>
        </nav>
      </div>
    </div>
  );
}
