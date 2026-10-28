'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import { showToast, setCartDrawer } from '@/store/uiSlice';
import { formatPriceSafe, formatINR } from '@/lib/pricing';
import Button from '@/components/ui/Button';

const blurDataURL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
import Icon from '@/components/ui/Icon';
import ServiceabilityChecker from '@/components/store/ServiceabilityChecker';
import ProductRail from '@/components/store/ProductRail';
import {
  getLocalizedProductName,
  getLocalizedProductTagline,
  getLocalizedCategoryName
} from '@/lib/translate-backend';
import { getProductWhatsAppUrl } from '@/lib/site-config';
import styles from './ProductDetailClient.module.css';

const defaultFurnitureFinishes = [
  { id: 'teak', name: 'Warm Teak Finish', code: '#7a4e28', desc: 'Hand-rubbed natural teak lacquer' },
  { id: 'honey', name: 'Honey Oak', code: '#c49a62', desc: 'Golden amber glow with natural grain' },
  { id: 'walnut', name: 'Rich Walnut', code: '#3d261a', desc: 'Deep roasted dark walnut stain' },
  { id: 'emerald', name: 'Royal Emerald', code: '#1a4329', desc: 'Signature deep jewel velvet upholstery' }
];

const defaultApplianceFinishes = [
  { id: 'inox', name: 'Brushed Inox Steel', code: '#8a9096', desc: 'Fingerprint-resistant stainless finish' },
  { id: 'black', name: 'Piano Black Glass', code: '#181818', desc: 'Reflective toughened mirror glass' },
  { id: 'red', name: 'Wine Scarlet', code: '#7a1f26', desc: 'Embossed floral metallic finish' }
];

const viewLabels = {
  front: 'Front View',
  angle: 'Three-Quarter Angle',
  detail: 'Material & Craft Detail',
  lifestyle: 'Styled Room Placement',
  interior: 'Internal Storage & Structure',
  back: 'Rear Architecture',
  packaging: 'Packaging & Accessories',
};

const defaultFaqs = [
  {
    q: 'How does doorstep delivery and white-glove installation work?',
    a: 'We provide specialized furniture and appliance transport across Prayagraj, Varanasi, Kaushambi and surrounding districts. Our trained technicians unpack, inspect, and assemble your pieces right in your desired room at no extra charge.'
  },
  {
    q: 'Can I customize dimensions, fabric colors, or wood polish?',
    a: 'Yes! All Riddhy handcrafted timber pieces can be tailored in wood finish (Teak, Honey, Walnut) and fabric choices. Click our WhatsApp Concierge button to discuss custom sizing directly with our master craftsmen.'
  },
  {
    q: 'What is covered under the 10-Year Warranty?',
    a: 'Our 10-year warranty covers solid hardwood frames, structural joints, termite treatment, and internal framework. Appliances come with complete manufacturer warranties (up to 10 years on inverter compressors).'
  },
  {
    q: 'What if the packaging cannot fit through my doorway or elevator?',
    a: 'Refer to the Box & Packaging Dimensions in the specifications table below. Our delivery team conducts entryway clearance checks before unloading, and knock-down modular assembly is available for tight stairways.'
  }
];

export default function ProductDetailClient({ product, related = [] }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const wishlisted = useSelector((state) =>
    Boolean(state.auth?.isAuthenticated && state.wishlist.items.some((item) => item.slug === product.slug))
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? wishlisted : false;
  const waUrl = getProductWhatsAppUrl(product, locale);

  const [activeMedia, setActiveMedia] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const isAppliance = product.type === 'appliance';
  const finishOptions = isAppliance ? defaultApplianceFinishes : defaultFurnitureFinishes;
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const touchStartXRef = useRef(null);

  // Live Pincode Estimator State
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState('idle');
  const [pinMessage, setPinMessage] = useState('');
  const [pinPerks, setPinPerks] = useState([]);
  const [deliveryDateStr, setDeliveryDateStr] = useState('');

  // Calculate dynamic delivery date (3 days out)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDateStr(
      d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    );
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rf_pincode');
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        setPinStatus('success');
        setPinMessage(`✓ Verified for ${saved}`);
        setPinPerks([
          `Free Delivery by ${deliveryDateStr || '3-4 Days'}`,
          'Free White-Glove Installation & Room Placement Included',
          '10-Day Safe Transit Guarantee'
        ]);
      }
    } catch { }
  }, [deliveryDateStr]);

  const handlePincodeCheck = async (e) => {
    e?.preventDefault?.();
    if (!/^\d{6}$/.test(pincode)) {
      setPinStatus('error');
      setPinMessage('Please enter a valid 6-digit PIN code');
      setPinPerks([]);
      return;
    }
    setPinStatus('loading');
    setPinMessage('Checking delivery and installation slots...');
    try {
      const res = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      const data = await res.json();
      if (data.success) {
        setPinStatus('success');
        setPinMessage(`✓ Delivery & Assembly available to ${pincode}`);
        setPinPerks([
          `Free Delivery by ${deliveryDateStr}`,
          'Free White-Glove Assembly & Room Placement Included',
          '10-Day Safe Transit Guarantee'
        ]);
        try {
          localStorage.setItem('rf_pincode', pincode);
        } catch { }
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
  const discountAmount = product.mrp > product.price ? product.mrp - product.price : 0;
  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const emiAmount = hasValidPrice ? Math.round(product.price / 6) : 0;

  const media = useMemo(() => {
    if (product.gallery && product.gallery.length > 0) {
      // Show ONLY 2 images: Front and Back as requested by client
      const front = product.gallery.find((g) => g.view === 'front') || product.gallery[0];
      const back = product.gallery.find((g) => g.view === 'back') || product.gallery.find((g) => g !== front && g.url !== front.url);

      const items = [front];
      if (back && back.url !== front.url) {
        items.push(back);
      }

      return items.map((g, idx) => ({
        src: g.large || g.medium || g.url,
        thumb: g.thumbUrl || g.thumb || g.url,
        blurDataURL: g.blurDataURL || blurDataURL,
        alt: g.alt || `${product.name} — ${idx === 0 ? 'Front View' : 'Back View'}`,
        view: idx === 0 ? 'front' : 'back',
        viewType: g.viewType || 'verified-product',
      }));
    }
    return [
      {
        src: product.image || '/images/product-sofa.webp',
        alt: product.imageAlt || `${product.name} product photo`,
        blurDataURL,
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
      if (e.key === 'ArrowLeft') prevMedia();
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, prevMedia, nextMedia]);

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
      variantId: `${product.sku}-${selectedFinish.id}`,
      selectedFinish: selectedFinish.name,
      qty
    }));
    dispatch(showToast({
      message: `${qty} × ${product.name} (${selectedFinish.name}) added to your bag`,
      kind: 'success'
    }));
    dispatch(setCartDrawer(true));
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      dispatch(showToast({
        message: 'Please sign in to proceed with direct checkout',
        kind: 'info'
      }));
      router.push(`/account?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    dispatch(addItem({
      ...product,
      variantId: `${product.sku}-${selectedFinish.id}`,
      selectedFinish: selectedFinish.name,
      qty
    }));
    router.push('/checkout');
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
  const isLowStock = isAvailable && product.stock <= (product.lowStockAt || 3);

  const reviewsList = useMemo(() => {
    if (product.reviews && product.reviews.length > 0) return product.reviews;
    return [
      {
        id: 1,
        name: 'Amitabh Sharma',
        city: 'Civil Lines, Prayagraj',
        rating: 5,
        date: '2 weeks ago',
        verified: true,
        title: 'Superb timber finish & zero hassle installation',
        text: 'The piece was delivered in pristine condition directly from the Mansurabad showroom. The carpenters assembled it right in our hall and carried out all leveling. Outstanding value!'
      },
      {
        id: 2,
        name: 'Pooja Vishwakarma',
        city: 'Naini, Prayagraj',
        rating: 5,
        date: '3 weeks ago',
        verified: true,
        title: 'Verified showroom quality & quick WhatsApp response',
        text: 'I requested real showroom video over WhatsApp before placing the order. They replied in 5 minutes with complete angle shots. Delivery was on time and very professional.'
      },
      {
        id: 3,
        name: 'Rameshwar Kushwaha',
        city: 'Varanasi, UP',
        rating: 5,
        date: '1 month ago',
        verified: true,
        title: 'Heavy gauge build, feels like a luxury showroom piece',
        text: 'Very comfortable ergonomic proportions and solid timber joinery. The packaging had thick corner reinforcements, so not even a scratch in transit.'
      }
    ];
  }, [product.reviews]);

  return (
    <>
      {/* Refined Accessible Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <div className={styles.breadcrumbItems}>
            <Link href="/">Home</Link>
            <span className={styles.crumbSep}>/</span>
            <Link href={product.type === 'furniture' ? '/furniture' : '/appliances'}>
              {product.type === 'furniture' ? 'Furniture Collection' : 'Home Appliances'}
            </Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCategory}>
              {getLocalizedCategoryName(product.categoryLabel || product.category, locale)}
            </span>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>{product.name}</span>
          </div>
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
                <Image
                  src={media[activeMedia]?.src || product.image}
                  alt={media[activeMedia]?.alt || product.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 52vw"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  onClick={() => setLightboxOpen(true)}
                  className={styles.mainMediaImg}
                  unoptimized={Boolean(
                    (media[activeMedia]?.src || product.image)?.startsWith('/api/files/') ||
                    (media[activeMedia]?.src || product.image)?.startsWith('/uploads/')
                  )}
                />

                {/* Stock / Highlight Badges */}
                <div className={styles.mediaBadgesRow}>
                  {discountPercent > 0 && (
                    <span className={styles.discountBadge}>
                      Save {discountPercent}%
                    </span>
                  )}
                  {product.tags?.includes('best-selling') && (
                    <span className={styles.bestSellerBadge}>
                      ★ Best Seller
                    </span>
                  )}
                  {product.warranty?.period && (
                    <span className={styles.warrantyTagBadge}>
                      🛡️ {product.warranty.period}
                    </span>
                  )}
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

                {/* Navigation Controls */}
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
              </div>

              {/* Thumbnail Strip */}
              {media.length > 1 && (
                <div className={styles.thumbs}>
                  {media.map((item, index) => (
                    <button
                      type="button"
                      className={`${styles.thumbBtn} ${activeMedia === index ? styles.thumbActive : ''}`}
                      aria-label={`Show ${viewLabels[item.view] || `image ${index + 1}`}: ${item.alt}`}
                      key={item.src + index}
                      onClick={() => setActiveMedia(index)}
                      title={viewLabels[item.view] || `View ${index + 1}`}
                    >
                      <Image
                        src={item.thumb || item.src}
                        alt=""
                        width={78}
                        height={78}
                        unoptimized={Boolean(
                          (item.thumb || item.src)?.startsWith('/api/files/') ||
                          (item.thumb || item.src)?.startsWith('/uploads/')
                        )}
                      />
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
                      unoptimized={Boolean(
                        (media[activeMedia]?.src || product.image)?.startsWith('/api/files/') ||
                        (media[activeMedia]?.src || product.image)?.startsWith('/uploads/')
                      )}
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
                          unoptimized={Boolean(
                            (item.thumb || item.src)?.startsWith('/api/files/') ||
                            (item.thumb || item.src)?.startsWith('/uploads/')
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Craftsmanship & Quality Assurance Grid */}
              <div className={styles.galleryTrust}>
                <div className={styles.galleryTrustHeading}>
                  <span className={styles.artisanBadge}>
                    <Icon name="check" size={14} color="#1b5e20" />
                    Quality & Showroom Assurances
                  </span>
                  <span className={styles.artisanSub}>
                    Directly inspected and dispatched from Mansurabad, Prayagraj
                  </span>
                </div>

                <div className={styles.trustBadges}>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🛡️</div>
                    <div className={styles.trustBadgeText}>
                      <b>10-Year Solid Frame Warranty</b>
                      <span>Hardwood structural timber & joinery</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🚚</div>
                    <div className={styles.trustBadgeText}>
                      <b>Free White-Glove Setup</b>
                      <span>Room placement & expert assembly</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🔄</div>
                    <div className={styles.trustBadgeText}>
                      <b>10-Day Safe Transit</b>
                      <span>Transit damage replacement cover</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>💳</div>
                    <div className={styles.trustBadgeText}>
                      <b>No-Cost EMI & COD</b>
                      <span>Starting from ₹{emiAmount.toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className={styles.info}>
              <div className={styles.brandRow}>
                <span className={styles.brandName}>{product.brand || 'RF Riddhy'}</span>
                <span className={styles.brandDot}>·</span>
                <span className={styles.categoryName}>
                  {getLocalizedCategoryName(product.categoryLabel || product.category, locale)}
                </span>
                {product.sku && (
                  <>
                    <span className={styles.brandDot}>·</span>
                    <span className={styles.skuTag}>SKU: {product.sku}</span>
                  </>
                )}
              </div>

              <h1 className={styles.productTitle}>{getLocalizedProductName(product, locale)}</h1>
              {product.tagline && (
                <p className={styles.tagline}>{getLocalizedProductTagline(product, locale)}</p>
              )}

              {/* Ratings and Reviews Summary Bar */}
              <div className={styles.ratingBar}>
                <div className={styles.starCluster}>
                  <span className={styles.ratingScore}>{product.rating || '4.8'}</span>
                  <div className={styles.starsWrapper}>
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        size={14}
                        style={{ fill: '#d99726', color: '#d99726' }}
                      />
                    ))}
                  </div>
                </div>
                <span className={styles.reviewCount}>
                  ({product.reviewCount || reviewsList.length * 12} Verified Reviews)
                </span>
                <a href="#reviews" className={styles.jumpReviewsLink}>
                  Read reviews ↓
                </a>
              </div>

              {/* Price Architecture Box */}
              <div className={styles.priceCard}>
                <div className={styles.priceMainRow}>
                  {hasValidPrice ? (
                    <>
                      <span className={styles.mainPrice}>{priceFormatted}</span>
                      {product.mrp > product.price && mrpFormatted && (
                        <del className={styles.mrpPrice}>{mrpFormatted}</del>
                      )}
                      {discountAmount > 0 && (
                        <span className={styles.savingsPill}>
                          Save {formatINR(discountAmount)} ({discountPercent}% OFF)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={styles.inquiryPrice}>Price on Inquiry · Call for Showroom Quote</span>
                  )}
                </div>

                <div className={styles.priceSubRow}>
                  <span className={styles.taxNote}>Inclusive of all taxes · Free Doorstep Delivery</span>
                  {hasValidPrice && emiAmount > 0 && (
                    <span className={styles.emiHighlight}>
                      ⚡ No-Cost EMI from <strong>₹{emiAmount.toLocaleString('en-IN')}/mo</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Finish / Wood / Color Selector */}
              <div className={styles.variantsBlock}>
                <div className={styles.variantHead}>
                  <span className={styles.variantLabel}>
                    {isAppliance ? 'Selected Finish:' : 'Selected Finish & Wood:'}
                  </span>
                  <b className={styles.variantValue}>{selectedFinish.name}</b>
                  <span className={styles.variantDesc}>({selectedFinish.desc})</span>
                </div>
                <div className={styles.swatchList}>
                  {finishOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`Choose finish ${item.name}`}
                      className={`${styles.swatchBtn} ${selectedFinish.id === item.id ? styles.swatchActive : ''}`}
                      onClick={() => setSelectedFinish(item)}
                      title={`${item.name} - ${item.desc}`}
                    >
                      <span className={styles.swatchColor} style={{ backgroundColor: item.code }} />
                      <span className={styles.swatchNameText}>{item.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Quick Summary */}
              {dims.width && (
                <div className={styles.dimensionFirst}>
                  <div className={styles.dimMeta}>
                    <span className={styles.dimLabel}>DIMENSIONS OVERVIEW</span>
                    <b className={styles.dimVal}>{dims.width} × {dims.depth} × {dims.height} cm</b>
                    <small className={styles.dimSub}>Width × Depth × Height · Doorway clearance verified</small>
                  </div>
                  <a href="#specs" className={styles.dimBtn}>
                    View Specs <Icon name="arrow" size={14} />
                  </a>
                </div>
              )}

              {/* Real-time Inventory & Warehouse Dispatch Status */}
              <div className={styles.stockStatus}>
                <span className={`${styles.stockDot} ${isAvailable ? (isLowStock ? styles.stockDotLow : styles.stockDotIn) : styles.stockDotOut}`} />
                <span className={styles.stockText}>
                  {isAvailable
                    ? isLowStock
                      ? `Only ${product.stock} units remaining · Order promptly to avoid waitlist`
                      : `In Stock · Ready to dispatch from Mansurabad warehouse within 24 hours`
                    : 'Currently Out of Stock · Pre-orders accepted via WhatsApp'}
                </span>
              </div>

              {/* Purchase Actions */}
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
                  className={styles.addCartBtn}
                >
                  <Icon name="bag" size={16} />
                  {!hasValidPrice
                    ? 'Currently Unavailable'
                    : isAvailable
                      ? `Add to Bag · ${formatPriceSafe(product.price * qty)}`
                      : 'Out of Stock'}
                </Button>

                <button
                  type="button"
                  className={styles.buyNowBtn}
                  onClick={handleBuyNow}
                  disabled={!isAvailable || !hasValidPrice}
                >
                  Buy Now
                </button>


              </div>

              {/* VIP Direct WhatsApp Concierge Card */}
              <div className={styles.waConciergeCard}>
                <div className={styles.waConciergeTop}>
                  <div className={styles.waAvatarWrap}>
                    <Icon name="whatsapp" size={24} color="#ffffff" />
                    <span className={styles.waLiveDot} />
                  </div>
                  <div className={styles.waConciergeMeta}>
                    <div className={styles.waTitleRow}>
                      <span className={styles.waMainTitle}>
                        Direct WhatsApp Order & Video Inspection
                      </span>
                      <span className={styles.waStatusBadge}>
                        <span className={styles.waStatusGlow} />
                        Showroom Live · Replies in ~5 mins
                      </span>
                    </div>
                    <p className={styles.waDesc}>
                      Request live showroom video, custom sizes, finish swatches, or order directly via WhatsApp.
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
                  <span className={styles.waPillPrompt}>Quick Inquiries:</span>
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
                    🏷️ Best Festive Offer
                  </a>
                </div>
              </div>

              {/* Live Pincode Estimator */}
              <div className={styles.pincodeWidget}>
                <div className={styles.pincodeHeader}>
                  <div className={styles.pincodeTitle}>
                    <Icon name="pin" size={16} />
                    <span>Check Delivery Date & Free Installation</span>
                  </div>
                </div>
                <form className={styles.pincodeForm} onSubmit={handlePincodeCheck}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit delivery PIN code"
                    className={styles.pincodeInput}
                  />
                  <button type="submit" className={styles.pincodeBtn} disabled={pinStatus === 'loading'}>
                    {pinStatus === 'loading' ? 'Checking...' : 'Check'}
                  </button>
                </form>
                {pinMessage && (
                  <div className={`${styles.pincodeResult} ${pinStatus === 'success' ? styles.pincodeSuccess : styles.pincodeError}`}>
                    <div className={styles.pinMessageText}>{pinMessage}</div>
                    {pinPerks.length > 0 && (
                      <div className={styles.pincodePerks}>
                        {pinPerks.map((perk, i) => (
                          <span key={i} className={styles.perkLine}>
                            ✓ {perk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sizing & Consultation Assistance Bar */}
              <div className={styles.consultBanner}>
                <div>
                  <b className={styles.consultTitle}>Need room planning or customized design advice?</b>
                  <p className={styles.consultSub}>Our interior specialists can advise on wood matching, clearance & layouts.</p>
                </div>
                <Link
                  href={`/consultation?interest=${isAppliance ? 'appliances' : 'furniture'}&product=${product.slug}`}
                  className={styles.consultBtn}
                >
                  Book Free Consultation <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Specifications, Assembly & Serviceability */}
          <div className={styles.detailBlocks}>
            <section className={styles.specs}>
              <span className="kicker">Technical Specifications</span>
              <h2>Detailed Craftsmanship & Dimensions.</h2>

              <div className={styles.specGrid}>
                <div>
                  <span>Brand</span>
                  <b>{product.brand || 'RF Riddhy'}</b>
                </div>
                <div>
                  <span>Primary Material</span>
                  <b>{product.specs?.material || (isAppliance ? 'High-Grade Metal & Toughened Glass' : 'Solid Seasoned Teak / Hardwood')}</b>
                </div>
                <div>
                  <span>Finish / Color</span>
                  <b>{selectedFinish.name}</b>
                </div>
                <div>
                  <span>Product Dimensions</span>
                  <b>{dims.width ? `${dims.width}W × ${dims.depth}D × ${dims.height}H cm` : 'As per showroom standard'}</b>
                </div>
                {product.specs?.seatingCapacity && (
                  <div>
                    <span>Seating Capacity</span>
                    <b>{product.specs.seatingCapacity}</b>
                  </div>
                )}
                {product.specs?.roomType && (
                  <div>
                    <span>Recommended Room</span>
                    <b>{product.specs.roomType}</b>
                  </div>
                )}
                {product.specs?.assemblyRequired !== undefined && (
                  <div>
                    <span>Assembly</span>
                    <b>{product.specs.assemblyRequired ? 'Free Carpenter Assembly Included' : 'Pre-Assembled'}</b>
                  </div>
                )}
                {product.specs?.warranty && (
                  <div>
                    <span>Warranty</span>
                    <b>{product.specs.warranty}</b>
                  </div>
                )}

                {/* Additional custom specs */}
                {Object.entries(product.specs || {})
                  .filter(([key]) => !['material', 'seatingCapacity', 'roomType', 'assemblyRequired', 'warranty'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                      <b>{String(value)}</b>
                    </div>
                  ))}
              </div>

              {/* Package Dimensions Card */}
              <div className={styles.package}>
                <b>Box & Delivery Packaging Dimensions</b>
                <span>
                  {product.packageDimensions?.width || (dims.width ? dims.width + 10 : 200)} ×{' '}
                  {product.packageDimensions?.depth || (dims.depth ? dims.depth + 10 : 90)} ×{' '}
                  {product.packageDimensions?.height || (dims.height ? dims.height + 12 : 95)} cm
                </span>
                <small>Reinforced edge corners with waterproof shrink-wrap protection. Verified for standard lifts and doorways.</small>
              </div>
            </section>

            <section className={styles.service}>
              <span className="kicker">Showroom Delivery & Pincode Coverage</span>
              <h2>Fast Doorstep Transport in UP.</h2>
              <p>
                All furniture and appliances are safely loaded from our central warehouse in Mansurabad, Prayagraj.
                Enter your pincode to confirm transit and free white-glove setup.
              </p>
              <ServiceabilityChecker />
            </section>
          </div>

          {/* Customer Reviews Section */}
          <section id="reviews" className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <div>
                <span className="kicker">Customer Reviews</span>
                <h2>Feedback from Verified Buyers.</h2>
                <p>Authentic reviews and ratings from homes across Uttar Pradesh.</p>
              </div>
              <div className={styles.reviewScoreCard}>
                <div className={styles.scoreNumber}>{product.rating || '4.8'}</div>
                <div className={styles.scoreDetails}>
                  <div className={styles.scoreStars}>★★★★★</div>
                  <span>Based on {product.reviewCount || 38} reviews</span>
                </div>
              </div>
            </div>

            <div className={styles.reviewsList}>
              {reviewsList.map((rev) => (
                <article key={rev.id} className={styles.reviewCard}>
                  <div className={styles.reviewCardHead}>
                    <div className={styles.reviewerAvatar}>
                      {rev.name.charAt(0)}
                    </div>
                    <div className={styles.reviewerMeta}>
                      <b>{rev.name}</b>
                      <span>{rev.city} · {rev.date}</span>
                    </div>
                    <span className={styles.verifiedTag}>
                      ✓ Verified Buyer
                    </span>
                  </div>
                  <div className={styles.reviewRatingStars}>
                    {[...Array(5)].map((_, idx) => (
                      <span key={idx} style={{ color: '#d99726' }}>★</span>
                    ))}
                  </div>
                  <h4 className={styles.reviewTitle}>{rev.title}</h4>
                  <p className={styles.reviewBody}>{rev.text}</p>
                </article>
              ))}
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className={styles.faqSection}>
            <span className="kicker">Questions & Answers</span>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {defaultFaqs.map((faq, idx) => (
                <div key={idx} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQuestionBtn}
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    aria-expanded={openFaqIndex === idx}
                  >
                    <span>{faq.q}</span>
                    <span className={styles.faqIcon}>{openFaqIndex === idx ? '−' : '+'}</span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Related Products Rail */}
          {related.length > 0 && (
            <section className={styles.related}>
              <div className="container">
                <span className="kicker">Curated Recommendations</span>
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
              src={media[0]?.thumb || media[0]?.src || product.image || '/images/product-sofa.webp'}
              alt={product.name}
              fill
              sizes="44px"
              unoptimized={Boolean(
                (product.image || media[0]?.src)?.startsWith('/api/files/') ||
                (product.image || media[0]?.src)?.startsWith('/uploads/')
              )}
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
                ? 'Add to Bag'
                : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </>
  );
}
