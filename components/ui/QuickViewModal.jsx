'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { showToast, setCartDrawer } from '@/store/uiSlice';
import { formatPriceSafe } from '@/lib/pricing';
import { formatINR } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import Icon from './Icon';
import { getProductWhatsAppUrl } from '@/lib/site-config';
import styles from './QuickViewModal.module.css';

export default function QuickViewModal({ product, onClose }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const waUrl = getProductWhatsAppUrl(product, locale);

  // Gallery items
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery.map((g) => g.largeUrl || g.mediumUrl || g.url)
      : [product.image || IMG.products.sofa];

  const currentImage = gallery[selectedIdx] || gallery[0];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const priceFormatted = formatPriceSafe(product.price);
  const mrpFormatted = formatPriceSafe(product.mrp);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to add items to your bag', kind: 'info' }));
      return;
    }
    dispatch(addItem({ ...product, qty, variantId: product.sku }));
    dispatch(showToast({ message: `${qty} × ${product.name} added to your bag`, kind: 'success' }));
    dispatch(setCartDrawer(true));
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <Icon name="close" size={18} />
        </button>

        <div className={styles.grid}>
          {/* Gallery Column */}
          <div className={styles.galleryWrap}>
            <div className={styles.mainImgWrap}>
              <Image
                src={currentImage}
                alt={product.name}
                fill
                sizes="(max-width: 680px) 90vw, 400px"
                className={styles.mainImg}
                unoptimized={currentImage.startsWith('/api/files/') || currentImage.startsWith('/uploads/')}
              />
            </div>

            {gallery.length > 1 && (
              <div className={styles.thumbsRow}>
                {gallery.map((imgUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`${styles.thumbBtn} ${idx === selectedIdx ? styles.thumbBtnActive : ''}`}
                    onClick={() => setSelectedIdx(idx)}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill sizes="60px" className={styles.thumbImg} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className={styles.details}>
            <span className={styles.categoryTag}>{product.categoryLabel || product.category || 'Collection'}</span>
            <h2 className={styles.productName}>{product.name}</h2>
            {product.tagline && <p className={styles.tagline}>{product.tagline}</p>}

            <div className={styles.priceBlock}>
              <span className={styles.price}>{priceFormatted}</span>
              {product.mrp > product.price && mrpFormatted && <span className={styles.mrp}>{mrpFormatted}</span>}
              {product.discount > 0 && <span className={styles.discountBadge}>{product.discount}% OFF</span>}
            </div>

            <div className={styles.highlightsList}>
              <div className={styles.highlightItem}>
                <Icon name="truck" size={15} color="var(--rf-green-700)" />
                <span>White-Glove Delivery & On-Site Assembly</span>
              </div>
              <div className={styles.highlightItem}>
                <Icon name="shield" size={15} color="var(--rf-green-700)" />
                <span>10-Year Craftsmanship Guarantee</span>
              </div>
              <div className={styles.highlightItem}>
                <Icon name="check" size={15} color="var(--rf-green-700)" />
                <span>In Stock & Ready for Dispatch</span>
              </div>
            </div>

            <div className={styles.actionsRow}>
              <div className={styles.qtyPicker}>
                <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Icon name="minus" size={13} />
                </button>
                <span className={styles.qtyVal}>{qty}</span>
                <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>
                  <Icon name="plus" size={13} />
                </button>
              </div>

              <button type="button" className={styles.addBtn} onClick={handleAddToCart}>
                <span>Add to Bag</span>
                <Icon name="bag" size={16} />
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waBtn}
                title={locale === 'hi' ? 'व्हाट्सएप पर पूछें' : 'Inquire on WhatsApp'}
                aria-label={locale === 'hi' ? `${product.name} के लिए व्हाट्सएप पर पूछें` : `Inquire about ${product.name} on WhatsApp`}
              >
                <Icon name="whatsapp" size={17} color="#ffffff" />
                <span>{locale === 'hi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
              </a>
            </div>

            <Link href={`/product/${product.slug}`} className={styles.fullDetailsLink} onClick={onClose}>
              <span>View full product specifications, 3D model & reviews</span>
              <Icon name="arrow" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
