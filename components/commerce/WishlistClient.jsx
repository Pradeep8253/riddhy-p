'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeWishlistItem } from '@/store/wishlistSlice';
import ProductGrid from '@/components/ui/ProductGrid';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { tr } from '@/lib/i18n';
import styles from './WishlistClient.module.css';

export default function WishlistClient() {
  const items = useSelector((state) => state.wishlist.items);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const authChecked = useSelector((state) => state.auth?.checked);
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.empty}>
        <div className={styles.heart}>
          <Icon name="heart" size={44} />
        </div>
        <h2>{tr(locale, 'wishlistTitle')}</h2>
        <p>{tr(locale, 'wishlistSubtitle')}</p>
        <Button href="/furniture">{tr(locale, 'browseFurniture')}</Button>
      </div>
    );
  }

  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.empty}>
        <div className={styles.heart}>
          <Icon name="heart" size={44} />
        </div>
        <h2>{tr(locale, 'signInWishlist')}</h2>
        <p>{tr(locale, 'signInWishlistSubtitle')}</p>
        <Button href="/account?redirect=/wishlist">{tr(locale, 'signInToAccount')}</Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.heart}>
          <Icon name="heart" size={44} />
        </div>
        <h2>{tr(locale, 'wishlistTitle')}</h2>
        <p>{tr(locale, 'wishlistSubtitle')}</p>
        <Button href="/furniture">{tr(locale, 'browseFurniture')}</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.top}>
        <span>
          {items.length} {items.length === 1 ? 'saved piece' : 'saved pieces'}
        </span>
        <button
          type="button"
          onClick={() => items.forEach((item) => dispatch(removeWishlistItem(item.slug)))}
        >
          {tr(locale, 'clearWishlist')}
        </button>
      </div>
      <ProductGrid products={items} />
    </div>
  );
}
