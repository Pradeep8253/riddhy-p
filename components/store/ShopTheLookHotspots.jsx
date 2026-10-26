'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { showToast, setCartDrawer } from '@/store/uiSlice';
import { formatINR } from '@/lib/pricing';
import Icon from '@/components/ui/Icon';
import styles from './ShopTheLookHotspots.module.css';

const defaultLook = {
  roomName: 'Curated Living Room',
  tagline: 'Balanced warmth, natural woods, and everyday comfort',
  image: '/images/room-living.webp?v=20261023',
  hotspots: [
    {
      id: 'sofa-hotspot',
      top: '60%',
      left: '50%',
      product: {
        id: 'demo-mira-3-seater-sofa',
        slug: 'mira-3-seater-sofa',
        sku: 'RF-0101-DEMO',
        name: 'Mira 3-Seater Sofa',
        tagline: 'Soft sage upholstery with solid wood base',
        categoryLabel: 'Sofas & Sectionals',
        price: 49990,
        mrp: 58800,
        image: '/images/products/mira-3-seater-sofa/front.webp'
      }
    },
    {
      id: 'decor-hotspot',
      top: '32%',
      left: '68%',
      product: {
        id: 'demo-aangan-accent-lamp',
        slug: 'aangan-accent-lamp',
        sku: 'RF-0701-DEMO',
        name: 'Aangan Accent Lamp',
        tagline: 'Warm diffused glow for evening calm',
        categoryLabel: 'Home Décor',
        price: 2490,
        mrp: 2990,
        image: '/images/products/aangan-accent-lamp/front.webp'
      }
    },
    {
      id: 'table-hotspot',
      top: '66%',
      left: '14%',
      product: {
        id: 'demo-sajilo-shoe-cabinet',
        slug: 'sajilo-shoe-cabinet',
        sku: 'RF-0802-DEMO',
        name: 'Sajilo Storage Console',
        tagline: 'Closed storage with warm natural grain',
        categoryLabel: 'Storage & Shelving',
        price: 18990,
        mrp: 23990,
        image: '/images/products/sajilo-shoe-cabinet/front.webp'
      }
    }
  ]
};

function getPopoverPosition(spot) {
  const topVal = parseFloat(spot.top) || 50;
  const leftVal = parseFloat(spot.left) || 50;

  const vertical = topVal > 52 ? 'above' : 'below';
  let horizontal = 'center';
  if (leftVal < 30) {
    horizontal = 'left';
  } else if (leftVal > 70) {
    horizontal = 'right';
  }

  return { vertical, horizontal };
}

export default function ShopTheLookHotspots({ look = defaultLook }) {
  const effectiveLook =
    look && Array.isArray(look.hotspots) && look.hotspots.length > 0
      ? look
      : defaultLook;
  const [activePin, setActivePin] = useState(
    effectiveLook.hotspots[0]?.id || null,
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to add items to your shopping bag', kind: 'info' }));
      router.push(`/account?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    dispatch(addItem({ ...product, variantId: product.sku, qty: 1 }));
    dispatch(showToast({ message: `${product.name} added to your bag`, kind: 'success' }));
    dispatch(setCartDrawer(true));
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.imageContainer}
        onClick={(e) => {
          if (e.target === e.currentTarget || e.target.classList.contains(styles.imageOverlay)) {
            setActivePin(null);
          }
        }}
      >
        <Image
          src={effectiveLook.image}
          alt={effectiveLook.roomName}
          fill
          className={styles.roomImage}
          sizes="(max-width: 1024px) 100vw, 1200px"
          priority
        />
        <div className={styles.imageOverlay} />

        {/* Hotspot Pins */}
        <div className={styles.hotspotsLayer}>
          {effectiveLook.hotspots.map((spot) => {
            const isActive = activePin === spot.id;
            const pos = getPopoverPosition(spot);
            const popoverClasses = [
              styles.popover,
              pos.vertical === 'above' ? styles.popoverAbove : styles.popoverBelow,
              pos.horizontal === 'left'
                ? styles.popoverLeft
                : pos.horizontal === 'right'
                ? styles.popoverRight
                : styles.popoverCenter
            ].join(' ');

            return (
              <div
                key={spot.id}
                className={`${styles.pinAnchor} ${isActive ? styles.pinAnchorActive : ''}`}
                style={{ top: spot.top, left: spot.left }}
              >
                <button
                  type="button"
                  className={styles.pinButton}
                  onClick={() => setActivePin(isActive ? null : spot.id)}
                  aria-expanded={isActive}
                  aria-label={`View ${spot.product.name} details`}
                >
                  <span className={styles.pinPulse} />
                  <span className={styles.pinCore}>
                    {isActive ? <Icon name="close" size={13} strokeWidth={2.4} /> : <Icon name="plus" size={13} strokeWidth={2.4} />}
                  </span>
                </button>

                {isActive && (
                  <div className={popoverClasses} role="dialog" aria-label={spot.product.name}>
                    <button
                      type="button"
                      className={styles.popoverClose}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(null);
                      }}
                      aria-label="Close details"
                    >
                      <Icon name="close" size={12} />
                    </button>
                    <div className={styles.popoverContent}>
                      <div className={styles.popoverThumb}>
                        <Image
                          src={spot.product.image}
                          alt={spot.product.name}
                          width={68}
                          height={68}
                          className={styles.thumbImg}
                        />
                      </div>
                      <div className={styles.popoverInfo}>
                        <span className={styles.category}>{spot.product.categoryLabel}</span>
                        <Link href={`/product/${spot.product.slug}`} className={styles.title}>
                          {spot.product.name}
                        </Link>
                        <div className={styles.priceRow}>
                          <strong>{formatINR(spot.product.price)}</strong>
                          {spot.product.mrp > spot.product.price && (
                            <del>{formatINR(spot.product.mrp)}</del>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.popoverActions}>
                      <Link href={`/product/${spot.product.slug}`} className={styles.viewLink}>
                        View Details <Icon name="arrow" size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(spot.product, e)}
                        className={styles.addBtn}
                        aria-label={`Add ${spot.product.name} to bag`}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile product drawer / pills */}
      <div className={styles.mobileList}>
        {effectiveLook.hotspots.map((spot) => (
          <div
            key={spot.id}
            className={`${styles.mobileCard} ${activePin === spot.id ? styles.mobileCardActive : ''}`}
            onClick={() => setActivePin(spot.id)}
          >
            <Image
              src={spot.product.image}
              alt=""
              width={48}
              height={48}
              className={styles.mobileThumb}
            />
            <div className={styles.mobileInfo}>
              <strong>{spot.product.name}</strong>
              <span>{formatINR(spot.product.price)}</span>
            </div>
            <button
              type="button"
              className={styles.mobileAdd}
              onClick={(e) => handleAddToCart(spot.product, e)}
              aria-label={`Add ${spot.product.name} to bag`}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
