'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { allProducts } from '@/data/products';
import './Header.css';

export default function Header(){
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const [q,setQ]=useState('');
  const debounced = useDebounce(q, 300);
  const [results,setResults]=useState([]);
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(!debounced){ setResults([]); setOpen(false); return; }
    const r = allProducts.filter(p=> p.title.toLowerCase().includes(debounced.toLowerCase()) || p.brand.toLowerCase().includes(debounced.toLowerCase())).slice(0,5);
    setResults(r); setOpen(r.length>0);
  },[debounced]);

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__logo">
          <span className="header__logoMark">RF</span>
          <span className="header__logoText"><strong>Riddhy</strong><small>Furniture & Appliances</small></span>
        </Link>

        <div className="header__search">
          <div className="header__searchBox">
            <span className="header__searchIcon">⌕</span>
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=> results.length&&setOpen(true)} onBlur={()=> setTimeout(()=>setOpen(false),200)} placeholder="Search for sofas, beds, refrigerators..." aria-label="Search"/>
            <button className="header__searchBtn">Search</button>
          </div>
          {open && (
            <div className="header__dropdown">
              {results.map(p=> (
                <Link key={p.slug} href={`/product/${p.slug}`} className="header__result">
                  <img src={p.images[0]} alt="" width={48} height={48}/>
                  <div><div className="header__resultTitle">{p.title}</div><div className="header__resultBrand">{p.brand} • ₹{p.price.toLocaleString('en-IN')}</div></div>
                </Link>
              ))}
              <Link href={`/search?q=${encodeURIComponent(q)}`} className="header__viewAll">View all results for “{q}” →</Link>
            </div>
          )}
        </div>

        <nav className="header__actions">
          <Link href="/wishlist" className="header__iconBtn" aria-label="Wishlist">
            <span className="header__icon">♡</span><span className="header__iconLabel">Wishlist</span>
            {wishCount>0 && <span className="header__badge">{wishCount}</span>}
          </Link>
          <Link href="/cart" className="header__iconBtn" aria-label="Cart">
            <span className="header__icon">🛒</span><span className="header__iconLabel">Cart</span>
            {count>0 && <span className="header__badge header__badge--primary">{count}</span>}
          </Link>
          <Link href={isAuthenticated?"/account":"/login"} className="header__account">
            <span className="header__avatar">{isAuthenticated? user.avatar : '👤'}</span>
            <span className="header__accountText"><small>{isAuthenticated? `Hi, ${user.name.split(' ')[0]}`:'Hello, sign in'}</small><strong>Account</strong></span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
