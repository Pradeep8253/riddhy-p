'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch,useSelector } from 'react-redux';
import { removeItem,setQuantity } from '@/store/cartSlice';
import { formatINR } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './CartClient.module.css';

export default function CartClient() {
  const items = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const authChecked = useSelector((state) => state.auth?.checked);
  const dispatch = useDispatch();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.empty}>
        <span>RF</span>
        <h2>Sign in to view your bag</h2>
        <p>Sign in to your Riddhy account to view saved items and proceed to secure checkout.</p>
        <div>
          <Button href="/account?redirect=/cart">Sign in to continue</Button>
          <Button href="/furniture" variant="outline">Shop furniture</Button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <span>RF</span>
        <h2>Your bag is ready for a good find.</h2>
        <p>Browse furniture or appliances, then add your favourites here.</p>
        <div>
          <Button href="/furniture">Shop furniture</Button>
          <Button href="/appliances" variant="outline">Shop appliances</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.items}>
        {items.map((item) => {
          const key = item.variantId || item.slug || item.id;
          return (
            <article className={styles.item} key={key}>
              <Link href={`/product/${item.slug}`} className={styles.image}>
                <Image
                  src={item.image || IMG.products.sofa}
                  alt={item.imageAlt || `${item.name} demo illustration`}
                  fill
                  sizes="120px"
                  unoptimized
                />
              </Link>
              <div className={styles.details}>
                <span>{item.brand || 'Riddhy Select'} · {item.categoryLabel || 'Home'}</span>
                <Link href={`/product/${item.slug}`}>
                  <b>{item.name}</b>
                </Link>
                <small>
                  {item.dimensions
                    ? `${item.dimensions.width} × ${item.dimensions.depth} × ${item.dimensions.height} cm`
                    : ''}
                </small>
                <button type="button" onClick={() => dispatch(removeItem(key))}>
                  Remove
                </button>
              </div>
              <div className={styles.controls}>
                <strong>{formatINR(item.price * item.qty)}</strong>
                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name} quantity`}
                    onClick={() => dispatch(setQuantity({ key, qty: item.qty - 1 }))}
                  >
                    <Icon name="minus" size={13} />
                  </button>
                  <span>{item.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name} quantity`}
                    onClick={() => dispatch(setQuantity({ key, qty: item.qty + 1 }))}
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className={styles.summary}>
        <span className={styles.kicker}>Your order</span>
        <h2>Basket summary</h2>
        <div className={styles.line}>
          <span>Items subtotal</span>
          <b>{formatINR(subtotal)}</b>
        </div>
        <div className={styles.line}>
          <span>Delivery & installation</span>
          <span>Calculated at checkout</span>
        </div>
        <div className={styles.line}>
          <span>Taxes</span>
          <span>Calculated at checkout</span>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <span>Estimated total</span>
          <b>{formatINR(subtotal)}</b>
        </div>
        <p>
          Final totals are calculated securely on the server from current SKU pricing, serviceability and any valid coupon.
        </p>
        <Button href="/checkout" size="lg" className={styles.checkout}>
          Continue to checkout <Icon name="arrow" size={16} />
        </Button>
        <div className={styles.secure}>Secure payment · Clear warranty terms</div>
      </aside>
    </div>
  );
}
