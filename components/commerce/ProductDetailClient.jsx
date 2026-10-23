'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import { showToast, setCartDrawer } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { formatPriceSafe } from '@/lib/pricing';
import { IMG } from '@/lib/images';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ServiceabilityChecker from '@/components/store/ServiceabilityChecker';
import ProductRail from '@/components/store/ProductRail';
import DimensionDiagram from './DimensionDiagram';
import {
  getLocalizedProductName,
  getLocalizedProductTagline,
  getLocalizedCategoryName
} from '@/lib/translate-backend';
import { getProductWhatsAppUrl } from '@/lib/site-config';
import styles from './ProductDetailClient.module.css';

const defaultSwatches = ['#6b8f5e', '#c4a47d', '#e7e2d7', '#28553a'];

const viewLabels = {
  front: 'Front View',
  angle: 'Three-Quarter Angle',
  detail: 'Material & Craft Detail',
  lifestyle: 'Styled Room Placement',
  interior: 'Internal Storage & Structure',
  back: 'Rear Architecture',
  packaging: 'Packaging & Accessories',
};

export default function ProductDetailClient({ product, related = [] }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const wishlisted = useSelector((state) => Boolean(state.auth?.isAuthenticated && state.wishlist.items.some((item) => item.slug === product.slug)));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? wishlisted : false;
  const waUrl = getProductWhatsAppUrl(product, locale);

  const [activeMedia, setActiveMedia] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [view, setView] = useState('photo');
  const [qty, setQty] = useState(1);
  const [finish, setFinish] = useState(defaultSwatches[0]);
  const touchStartXRef = useRef(null);

  // Live Pincode Estimator State
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState('idle');
  const [pinMessage, setPinMessage] = useState('');
  const [pinPerks, setPinPerks] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rf_pincode');
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
      }
    } catch {}
  }, []);

  const handlePincodeCheck = async (e) => {
    e?.preventDefault?.();
    if (!/^\d{6}$/.test(pincode)) {
      setPinStatus('error');
      setPinMessage('Please enter a valid 6-digit PIN code');
      setPinPerks([]);
      return;
    }
    setPinStatus('loading');
    setPinMessage('Checking delivery & installation slots...');
    try {
      const res = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      const data = await res.json();
      if (data.success) {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        const dateStr = date.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        setPinStatus('success');
        setPinMessage(`✓ Delivery available to ${pincode}`);
        setPinPerks([
          `Fastest Delivery by ${dateStr}`,
          'Free White-Glove Installation & Room Placement Included',
          '10-Day Safe Transit Guarantee'
        ]);
        try { localStorage.setItem('rf_pincode', pincode); } catch {}
      } else {
        setPinStatus('error');
        setPinMessage(data.error?.message || 'Delivery not yet available for this PIN code');
        setPinPerks([]);
      }
    } catch {
      setPinStatus('error');
      setPinMessage('Could not check pincode at this moment');
      setPinPerks([]);
    }
  };


  const priceFormatted = formatPriceSafe(product.price);
  const mrpFormatted = formatPriceSafe(product.mrp);
  const hasValidPrice = Boolean(priceFormatted);

  const media = useMemo(() => {
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery.map((g, idx) => ({
        src: g.large || g.medium || g.url,
        thumb: g.thumbUrl || g.thumb || g.url,
        blurDataURL: g.blurDataURL || IMG.blurDataURL,
        alt: g.alt || `${product.name} view ${idx + 1}`,
        view: g.view || (idx === 0 ? 'front' : idx === 1 ? 'angle' : idx === 2 ? 'detail' : idx === 3 ? 'lifestyle' : 'interior'),
        viewType: g.viewType || 'verified-product',
      }));
    }
    return [
      {
        src: product.image || IMG.products.sofa,
        alt: product.imageAlt || `${product.name} product photo`,
        blurDataURL: IMG.blurDataURL,
        view: 'front',
        viewType: 'verified-product',
      },
    ];
  }, [product]);

  const prevMedia = useCallback(() => {
    setActiveMedia((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  const nextMedia = useCallback(() => {
    setActiveMedia((prev) => (prev + 1) % media.length);
  }, [media.length]);

  // Keyboard navigation for image cycling and lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'photo') return;
      if (e.key === 'ArrowLeft') prevMedia();
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, lightboxOpen, prevMedia, nextMedia]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextMedia();
      else prevMedia();
    }
    touchStartXRef.current = null;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(showToast({
        message: 'Please sign in to add items to your shopping bag',
        kind: 'info'
      }));
      router.push(`/account?redirect=${encodeURIComponent(pathname || `/product/${product.slug}`)}`);
      return;
    }
    dispatch(addItem({
      ...product,
      variantId: product.sku,
      qty
    }));
    dispatch(showToast({
      message: `${qty} × ${product.name} added to your bag`,
      kind: 'success'
    }));
    dispatch(setCartDrawer(true));
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(showToast({
        message: 'Please sign in to save pieces to your wishlist',
        kind: 'info'
      }));
      router.push(`/account?redirect=${encodeURIComponent(pathname || `/product/${product.slug}`)}`);
      return;
    }
    dispatch(toggleWishlist(product));
    dispatch(showToast({
      message: wishlisted ? 'Removed from your wishlist' : `${product.name} saved to your wishlist`,
      kind: 'success'
    }));
  };

  const dims = product.dimensions || {};
  const isAvailable = product.stock > 0;

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={product.type === 'furniture' ? '/furniture' : '/appliances'}>
            {product.type === 'furniture' ? 'Furniture' : 'Appliances'}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>
      </nav>

      <section className={styles.product}>
        <div className="container">
          <div className={styles.grid}>
            {/* Gallery Section */}
            <div className={styles.gallery}>
              <div
                className={styles.mainMedia}
                aria-label={`Product media gallery for ${product.name}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                tabIndex={0}
              >
                {view === 'photo' && (
                  <>
                    <Image
                      src={media[activeMedia]?.src || product.image}
                      alt={media[activeMedia]?.alt || product.name}
                      fill
                      priority
                      sizes="(max-width: 900px) 100vw, 52vw"
                      placeholder="blur"
                      blurDataURL={IMG.blurDataURL}
                      onClick={() => setLightboxOpen(true)}
                      style={{ cursor: 'zoom-in' }}
                    />

                    {/* View Angle Badge */}
                    <div className={styles.viewAngleBadge}>
                      <span className={styles.viewAngleBadgeDot} />
                      <span>{viewLabels[media[activeMedia]?.view] || 'Product View'}</span>
                    </div>

                    {/* Zoom / Lightbox Trigger */}
                    <button
                      type="button"
                      className={styles.zoomTriggerBtn}
                      onClick={() => setLightboxOpen(true)}
                      title="Inspect texture in full zoom"
                      aria-label="Inspect texture in full zoom"
                    >
                      <Icon name="search" size={16} />
                    </button>

                    {/* Previous & Next Navigation Controls */}
                    {media.length > 1 && (
                      <>
                        <button
                          type="button"
                          className={`${styles.galleryNavBtn} ${styles.galleryNavPrev}`}
                          onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                          aria-label="Previous product image"
                        >
                          <Icon name="chevronLeft" size={20} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.galleryNavBtn} ${styles.galleryNavNext}`}
                          onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                          aria-label="Next product image"
                        >
                          <Icon name="chevronRight" size={20} />
                        </button>
                      </>
                    )}
                  </>
                )}

                {view === 'dimensions' && (
                  <div className={styles.diagram}>
                    <DimensionDiagram dimensions={dims} />
                    <span>Measurements are for planning. Refer to the specification table below.</span>
                  </div>
                )}

                <div className={styles.viewTabs} role="tablist" aria-label="Media view options">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'photo'}
                    onClick={() => setView('photo')}
                  >
                    Photos ({media.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'dimensions'}
                    onClick={() => setView('dimensions')}
                  >
                    Dimensions
                  </button>
                </div>
              </div>

              {view === 'photo' && (
                <div className={styles.thumbs}>
                  {media.map((item, index) => (
                    <button
                      type="button"
                      className={activeMedia === index ? styles.thumbActive : ''}
                      aria-label={`Show ${viewLabels[item.view] || `image ${index + 1}`}: ${item.alt}`}
                      key={item.src + index}
                      onClick={() => setActiveMedia(index)}
                      title={viewLabels[item.view] || `View ${index + 1}`}
                    >
                      <Image
                        src={item.thumb || item.src}
                        alt=""
                        width={90}
                        height={90}
                        unoptimized={Boolean((item.thumb || item.src)?.startsWith('/api/files/') || (item.thumb || item.src)?.startsWith('/uploads/'))}
                      />
                      <span className={styles.thumbBadge}>
                        {item.view || `view ${index + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Fullscreen Lightbox Zoom Modal */}
              {lightboxOpen && (
                <div
                  className={styles.lightboxOverlay}
                  onClick={() => setLightboxOpen(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Product texture zoom lightbox"
                >
                  <button
                    type="button"
                    className={styles.lightboxCloseBtn}
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Close zoom modal"
                  >
                    ✕
                  </button>

                  <div
                    className={styles.lightboxDialog}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={media[activeMedia]?.src || product.image}
                      alt={media[activeMedia]?.alt || product.name}
                      fill
                      priority
                      sizes="90vw"
                    />

                    {media.length > 1 && (
                      <>
                        <button
                          type="button"
                          className={`${styles.galleryNavBtn} ${styles.galleryNavPrev}`}
                          onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                          aria-label="Previous image"
                        >
                          <Icon name="chevronLeft" size={20} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.galleryNavBtn} ${styles.galleryNavNext}`}
                          onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                          aria-label="Next image"
                        >
                          <Icon name="chevronRight" size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  <div
                    className={styles.lightboxThumbsStrip}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {media.map((item, index) => (
                      <button
                        type="button"
                        key={'lb-' + item.src + index}
                        className={`${styles.lightboxThumbBtn} ${activeMedia === index ? styles.lightboxThumbActive : ''}`}
                        onClick={() => setActiveMedia(index)}
                        aria-label={`Select ${viewLabels[item.view] || `view ${index + 1}`}`}
                      >
                        <Image
                          src={item.thumb || item.src}
                          alt=""
                          width={64}
                          height={64}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Craftsmanship & Quality Highlights under Gallery (Fills vertical space with trust) */}
              <div className={styles.galleryTrust}>
                <div className={styles.galleryTrustHeading}>
                  <span className={styles.artisanBadge}>
                    <Icon name="check" size={14} color="#1b5e20" />
                    Craftsmanship & Quality Assurance
                  </span>
                  <span className={styles.artisanSub}>
                    Hand-inspected in workshop before white-glove dispatch
                  </span>
                </div>

                <div className={styles.trustBadges}>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🛡️</div>
                    <div className={styles.trustBadgeText}>
                      <b>10-Year Solid Warranty</b>
                      <span>Comprehensive frame & structure</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🚚</div>
                    <div className={styles.trustBadgeText}>
                      <b>White-Glove Assembly</b>
                      <span>Zero-effort on-site setup</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🔄</div>
                    <div className={styles.trustBadgeText}>
                      <b>10-Day Safe Transit</b>
                      <span>Zero-risk transit protection</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>💳</div>
                    <div className={styles.trustBadgeText}>
                      <b>No-Cost EMI Options</b>
                      <span>Available across major banks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className={styles.info}>
              <div className={styles.brand}>
                {product.brand || 'RF Riddhy'} <span>·</span> {getLocalizedCategoryName(product.categoryLabel || product.category, locale)}
              </div>

              <h1>{getLocalizedProductName(product, locale)}</h1>
              {product.tagline && <p className={styles.tagline}>{getLocalizedProductTagline(product, locale)}</p>}

              <div className={styles.rating}>
                {product.rating && product.reviewCount ? (
                  <span>
                    <Icon name="star" size={13} style={{ fill: '#d99726', color: '#d99726' }} /> {product.rating} · {product.reviewCount} reviews
                  </span>
                ) : (
                  <span>
                    4.8 <Icon name="star" size={13} style={{ fill: '#d99726', color: '#d99726' }} /> · Verified Customer Rating
                  </span>
                )}
                <a href="#reviews">View details</a>
              </div>

              <div className={styles.price}>
                {hasValidPrice ? (
                  <>
                    <strong>{priceFormatted}</strong>
                    {product.mrp > product.price && mrpFormatted && (
                      <>
                        <del>{mrpFormatted}</del>
                        {product.discount > 0 && <span>{product.discount}% off</span>}
                      </>
                    )}
                    <small>Applicable taxes and delivery charges calculated at checkout.</small>
                  </>
                ) : (
                  <span style={{ color: '#64748b' }}>Price on inquiry · Currently not available online</span>
                )}
              </div>

              <div className={styles.dimensionFirst}>
                <div>
                  <span className={styles.label}>DIMENSIONS</span>
                  <b>{dims.width} × {dims.depth} × {dims.height} cm</b>
                  <small>W × D × H · verify entryway clearances before ordering</small>
                </div>
                <button type="button" onClick={() => setView('dimensions')}>
                  View diagram <Icon name="arrow" size={15} />
                </button>
              </div>

              <div className={styles.variants}>
                <b>Finish / Colour</b>
                <div>
                  {defaultSwatches.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choose finish ${color}`}
                      aria-pressed={finish === color}
                      style={{ '--swatch': color }}
                      onClick={() => setFinish(color)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.warranty}>
                <Icon name="check" size={17} />
                <div>
                  <b>Transparent Coverage</b>
                  <span>
                    {product.warranty?.manufacturer ||
                      product.warranty?.seller ||
                      'Standard 2-year comprehensive coverage on frame and hardware'}
                  </span>
                  {product.warranty?.compressor && (
                    <span>{product.warranty.compressor}</span>
                  )}
                  <Link href="/policies/warranty" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Read warranty policy <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </div>

              <div className={styles.purchase}>
                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <Icon name="minus" size={13} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(Math.min(99, qty + 1))}
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={!isAvailable || !hasValidPrice}
                >
                  {!hasValidPrice
                    ? 'Currently Unavailable'
                    : isAvailable
                    ? `Add to bag · ${formatPriceSafe(product.price * qty)}`
                    : 'Out of stock'}
                </Button>

                <button
                  type="button"
                  className={styles.wishlistBtn}
                  onClick={handleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isWishlisted}
                  title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                >
                  <Icon name="heart" size={20} />
                </button>
              </div>

              {/* Premium WhatsApp VIP Concierge Card */}
              <div className={styles.waConciergeCard}>
                <div className={styles.waConciergeTop}>
                  <div className={styles.waAvatarWrap}>
                    <Icon name="whatsapp" size={24} color="#ffffff" />
                    <span className={styles.waLiveDot} />
                  </div>
                  <div className={styles.waConciergeMeta}>
                    <div className={styles.waTitleRow}>
                      <span className={styles.waMainTitle}>
                        Direct WhatsApp Order & Assistance
                      </span>
                      <span className={styles.waStatusBadge}>
                        <span className={styles.waStatusGlow} />
                        Online · Replies in ~5m
                      </span>
                    </div>
                    <p className={styles.waDesc}>
                      Get live showroom video, custom dimensions, fabric swatches or order directly.
                    </p>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waCtaBtn}
                  aria-label="Chat & Order on WhatsApp"
                >
                  <Icon name="whatsapp" size={19} color="#ffffff" />
                  <span>Order or Inquire via WhatsApp</span>
                  <Icon name="arrow" size={15} color="#ffffff" />
                </a>

                <div className={styles.waPillsList}>
                  <span className={styles.waPillPrompt}>
                    Quick Questions:
                  </span>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'photos')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask for real showroom photos"
                  >
                    📸 Real Photos / Video
                  </a>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'custom')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask about custom dimensions"
                  >
                    📐 Custom Dimensions
                  </a>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'discount')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask for best festive offer"
                  >
                    🏷️ Best Offer
                  </a>
                </div>
              </div>

              <p className={styles.stock}>
                <span />
                {isAvailable
                  ? `${product.stock || 12} units available for prompt delivery`
                  : 'Currently out of stock'}
              </p>

              {/* Live Pincode Estimator */}
              <div className={styles.pincodeWidget}>
                <div className={styles.pincodeHeader}>
                  <div className={styles.pincodeTitle}>
                    <Icon name="pin" size={16} />
                    <span>Delivery & Assembly Checker</span>
                  </div>
                </div>
                <form className={styles.pincodeForm} onSubmit={handlePincodeCheck}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit delivery pincode"
                    className={styles.pincodeInput}
                  />
                  <button type="submit" className={styles.pincodeBtn} disabled={pinStatus === 'loading'}>
                    {pinStatus === 'loading'
                      ? 'Checking...'
                      : 'Check'}
                  </button>
                </form>
                {pinMessage && (
                  <div className={`${styles.pincodeResult} ${pinStatus === 'success' ? styles.pincodeSuccess : styles.pincodeError}`}>
                    <div>{pinMessage}</div>
                    {pinPerks.length > 0 && (
                      <div className={styles.pincodePerks}>
                        {pinPerks.map((perk, i) => (
                          <span key={i}>• {perk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>



              <div style={{
                margin: '14px 0',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--rf-cream-50)',
                border: '1px solid var(--rf-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                fontSize: 13
              }}>
                <span style={{ color: 'var(--rf-charcoal-600)' }}>
                  Need sizing advice or fit assistance?
                </span>
                <Link
                  href={`/consultation?interest=${product.type === 'appliance' ? 'appliances' : 'furniture'}&product=${product.slug}`}
                  style={{ color: 'var(--rf-green-800)', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Book Free Consultation <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Specifications and Serviceability */}
          <div className={styles.detailBlocks}>
            <section className={styles.specs}>
              <span className="kicker">Product Specifications</span>
              <h2>Designed for Indian Homes.</h2>
              <div className={styles.specGrid}>
                {Object.entries(product.specs || {})
                  .filter(([, val]) => val)
                  .map(([key, value]) => (
                    <div key={key}>
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <b>{String(value)}</b>
                    </div>
                  ))}
              </div>

              <div className={styles.package}>
                <b>Box & Package Dimensions</b>
                <span>
                  {product.packageDimensions?.width || dims.width + 10} ×{' '}
                  {product.packageDimensions?.depth || dims.depth + 10} ×{' '}
                  {product.packageDimensions?.height || dims.height + 12} cm
                </span>
                <small>Ensure your building lift and doorways accommodate these dimensions.</small>
              </div>
            </section>

            <section className={styles.service}>
              <span className="kicker">Delivery & Installation</span>
              <h2>Check your pincode.</h2>
              <p>
                Delivery schedules, installation slots and transit options are confirmed for your location.
              </p>
              <ServiceabilityChecker />
            </section>
          </div>

          {/* Customer Reviews Section */}
          <section id="reviews" className={styles.reviews}>
            <span className="kicker">Customer Reviews</span>
            <h2>Feedback from Verified Owners.</h2>
            <p>
              Read authentic reviews and ratings from customers who purchased this item.
            </p>
          </section>

          {/* Related Products */}
          {related.length > 0 && (
            <section className={styles.related}>
              <div className="container">
                <h2>Complete the Look</h2>
                <ProductRail products={related} />
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Mobile Sticky Buy Bar */}
      <div className={styles.stickyBuy}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div className={styles.stickyThumb}>
            <Image
              src={media[0]?.thumb || media[0]?.src || product.image || IMG.products.sofa}
              alt={product.name}
              fill
              sizes="44px"
              unoptimized={Boolean((product.image || media[0]?.src)?.startsWith('/api/files/') || (product.image || media[0]?.src)?.startsWith('/uploads/'))}
            />
          </div>
          <div className={styles.stickyMeta}>
            <b>{getLocalizedProductName(product, locale)}</b>
            <span>{formatPriceSafe(product.price) || formatINR(product.price)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.stickyWaBtn}
            aria-label="Inquire on WhatsApp"
            title="Inquire on WhatsApp"
          >
            <Icon name="whatsapp" size={19} color="#ffffff" />
          </a>
          <button
            type="button"
            className={styles.stickyWishlistBtn}
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={isWishlisted}
            title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
          >
            <Icon name="heart" size={18} />
          </button>
          <Button
            onClick={handleAddToCart}
            size="sm"
            disabled={!isAvailable || !hasValidPrice}
          >
            {!hasValidPrice
              ? 'Unavailable'
              : isAvailable
              ? 'Add to bag'
              : 'Out of stock'}
          </Button>
        </div>
      </div>
    </>
  );
}
