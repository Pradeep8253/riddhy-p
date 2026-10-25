'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCartDrawer } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const cartCount = useSelector((state) =>
    (state.cart?.items || []).reduce((sum, item) => sum + (item.qty || 1), 0)
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on product detail pages (where sticky buy bar takes focus), checkout, or admin
  if (
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const displayWishlistCount = mounted ? wishlistCount : 0;
  const displayCartCount = mounted ? cartCount : 0;

  const isHomeActive = pathname === '/';
  const isCatalogActive =
    pathname?.startsWith('/furniture') ||
    pathname?.startsWith('/appliances') ||
    pathname?.startsWith('/utensils') ||
    pathname?.startsWith('/search');
  const isWishlistActive = pathname?.startsWith('/account/wishlist');
  const isAccountActive = pathname?.startsWith('/account') && !isWishlistActive;

  return (
    <nav className={styles.bottomNav} aria-label="Mobile navigation bar">
      {/* 1. Home */}
      <Link
        href="/"
        className={`${styles.navItem} ${isHomeActive ? styles.active : ''}`}
        aria-label="Home"
      >
        <div className={styles.iconWrap}>
          <Icon name="home" size={20} />
        </div>
        <span>Home</span>
      </Link>

      {/* 2. Catalog / Explore */}
      <Link
        href="/furniture"
        className={`${styles.navItem} ${isCatalogActive ? styles.active : ''}`}
        aria-label="Explore catalog"
      >
        <div className={styles.iconWrap}>
          <Icon name="sliders" size={20} />
        </div>
        <span>Catalog</span>
      </Link>

      {/* 3. Wishlist */}
      <Link
        href="/account/wishlist"
        className={`${styles.navItem} ${isWishlistActive ? styles.active : ''}`}
        aria-label="Wishlist"
      >
        <div className={styles.iconWrap}>
          <Icon name="heart" size={20} />
          {displayWishlistCount > 0 && <span className={styles.badge}>{displayWishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </Link>

      {/* 4. Cart Bag (Opens Cart Drawer) */}
      <button
        type="button"
        className={styles.navItem}
        onClick={() => dispatch(setCartDrawer(true))}
        aria-label="Open shopping bag"
      >
        <div className={styles.iconWrap}>
          <Icon name="bag" size={20} />
          {displayCartCount > 0 && <span className={styles.badge}>{displayCartCount}</span>}
        </div>
        <span>Bag</span>
      </button>

      {/* 5. Account */}
      <Link
        href="/account"
        className={`${styles.navItem} ${isAccountActive ? styles.active : ''}`}
        aria-label="Account"
      >
        <div className={styles.iconWrap}>
          <Icon name="user" size={20} />
        </div>
        <span>Account</span>
      </Link>
    </nav>
  );
}
