'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import { toggleCompare } from '@/store/compareSlice';
import { showToast } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import Icon from './Icon';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, compact = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const wishlisted = useSelector((state) => Boolean(state.auth?.isAuthenticated && state.wishlist.items.some((item) => item.slug === product.slug)));
  const compared = useSelector((state) => state.compare.items.some((item) => item.slug === product.slug));

  const add = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to add items to your shopping bag', kind: 'info' }));
      router.push(`/account?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    dispatch(addItem({ ...product, qty: 1, variantId: product.sku }));
    dispatch(showToast({ message: `${product.name} added to your bag`, kind: 'success' }));
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to save pieces to your wishlist', kind: 'info' }));
      router.push(`/account?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    dispatch(toggleWishlist(product));
    dispatch(showToast({
      message: wishlisted ? 'Removed from your wishlist' : `${product.name} saved to your wishlist`,
      kind: 'success'
    }));
  };

  const image = product.image || IMG.products.sofa;
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.media}>
        <Link href={`/product/${product.slug}`} className={styles.imageLink} aria-label={`View ${product.name}`}>
          <Image
            src={image}
            alt={product.imageAlt || `${product.name} product photography`}
            fill
            sizes="(max-width: 620px) 44vw, (max-width: 980px) 30vw, 22vw"
            placeholder="blur"
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            unoptimized
          />
        </Link>
        {product.discount > 0 && <span className={styles.discount}>{product.discount}% off</span>}
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            onClick={handleWishlist}
          >
            <Icon name="heart" size={18} />
          </button>
          <button
            type="button"
            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
            aria-pressed={compared}
            onClick={() => {
              dispatch(toggleCompare(product));
              dispatch(showToast({ message: compared ? 'Removed from compare' : 'Added to compare', kind: 'info' }));
            }}
          >
            <Icon name="compare" size={17} />
          </button>
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.meta}>
          {product.brand || 'Riddhy Select'} <span>·</span> {product.categoryLabel}
        </div>
        <Link href={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
        {!compact && <p className={styles.tagline}>{product.tagline}</p>}
        <div className={styles.priceRow}>
          <strong>{formatINR(product.price)}</strong>
          {product.mrp > product.price && <del>{formatINR(product.mrp)}</del>}
          <span className={styles.rating}>
            {product.rating ? (
              <>
                <Icon name="star" size={13} /> {product.rating}
              </>
            ) : (
              'Verified'
            )}
          </span>
        </div>
        <button
          type="button"
          className={styles.add}
          onClick={add}
          disabled={Number(product.stock || 0) <= 0}
        >
          <span>Add to bag</span>
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </article>
  );
}
