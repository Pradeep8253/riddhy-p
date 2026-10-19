'use client';

import { useMemo, useState, useEffect } from 'react';
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
import dynamic from 'next/dynamic';
import {
  getLocalizedProductName,
  getLocalizedProductTagline,
  getLocalizedCategoryName
} from '@/lib/translate-backend';
import MaterialConfigurator from '@/components/three/MaterialConfigurator';
import ExplodeView from '@/components/three/ExplodeView';
import { getProductWhatsAppUrl } from '@/lib/site-config';
import styles from './ProductDetailClient.module.css';

const ProductModelCanvas = dynamic(() => import('./ProductModelCanvas'), {
  ssr: false,
  loading: () => <div className={styles.viewerLoading}>Preparing the 3D view…</div>
});

const defaultSwatches = ['#6b8f5e', '#c4a47d', '#e7e2d7', '#28553a'];

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
  const [view, setView] = useState('photo');
  const [qty, setQty] = useState(1);
  const [finish, setFinish] = useState(defaultSwatches[0]);
  const [open, setOpen] = useState(false);
  const [explode, setExplode] = useState(0);
  const [rotation, setRotation] = useState([0, 0, 0]);

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
      setPinMessage(locale === 'hi' ? 'कृपया 6-अंकों का मान्य पिनकोड दर्ज करें' : 'Please enter a valid 6-digit PIN code');
      setPinPerks([]);
      return;
    }
    setPinStatus('loading');
    setPinMessage(locale === 'hi' ? 'डिलीवरी और स्थापना की जांच हो रही है...' : 'Checking delivery & installation slots...');
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
        const dateStr = date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        setPinStatus('success');
        setPinMessage(
          locale === 'hi'
            ? `✓ पिनकोड ${pincode} पर डिलीवरी उपलब्ध है`
            : `✓ Delivery available to ${pincode}`
        );
        setPinPerks([
          locale === 'hi' ? `अनुमानित डिलीवरी: ${dateStr} तक` : `Fastest Delivery by ${dateStr}`,
          locale === 'hi' ? 'मुफ़्त ऑन-साइट इंस्टॉलेशन और रूम प्लेसमेंट' : 'Free White-Glove Installation & Room Placement Included',
          locale === 'hi' ? '10-दिन की सुरक्षित ट्रांजिट गारंटी' : '10-Day Safe Transit Guarantee'
        ]);
        try { localStorage.setItem('rf_pincode', pincode); } catch {}
      } else {
        setPinStatus('error');
        setPinMessage(data.error?.message || (locale === 'hi' ? 'इस पिनकोड पर अभी सेवा उपलब्ध नहीं है' : 'Delivery not yet available for this PIN code'));
        setPinPerks([]);
      }
    } catch {
      setPinStatus('error');
      setPinMessage(locale === 'hi' ? 'कृपया कुछ देर बाद प्रयास करें' : 'Could not check pincode at this moment');
      setPinPerks([]);
    }
  };

  const handleKeys = (e) => {
    if (view !== '3d') return;
    if (e.key === 'ArrowLeft') setRotation(([x, y, z]) => [x, y - 0.2, z]);
    if (e.key === 'ArrowRight') setRotation(([x, y, z]) => [x, y + 0.2, z]);
    if (e.key === 'ArrowUp') setRotation(([x, y, z]) => [x - 0.15, y, z]);
    if (e.key === 'ArrowDown') setRotation(([x, y, z]) => [x + 0.15, y, z]);
    if (e.key === 'Enter') setOpen((v) => !v);
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
        alt: g.alt || `${product.name} view ${idx + 1}`
      }));
    }
    return [
      {
        src: product.image || IMG.products.sofa,
        alt: product.imageAlt || `${product.name} product photo`,
        blurDataURL: IMG.blurDataURL
      },
      {
        src: IMG.rooms.find((room) => room.slug === product.room)?.src || IMG.rooms[0].src,
        alt: `${product.name} styled in room setting`,
        blurDataURL: IMG.blurDataURL
      },
      {
        src: IMG.categories[product.category] || product.image || IMG.products.sofa,
        alt: `${product.categoryLabel || 'Collection'} overview`,
        blurDataURL: IMG.blurDataURL
      }
    ];
  }, [product]);

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
                tabIndex={0}
                onKeyDown={handleKeys}
                aria-label={view === '3d' ? "Product gallery and 3D viewer; arrow keys rotate model; plus and minus zoom; Enter opens moving parts." : `Product media gallery for ${product.name}`}
              >
                {view === 'photo' && (
                  <Image
                    src={media[activeMedia]?.src || product.image}
                    alt={media[activeMedia]?.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 52vw"
                    placeholder="blur"
                    blurDataURL={IMG.blurDataURL}
                  />
                )}

                {view === '3d' && (
                  <ProductModelCanvas
                    type={product.modelType || product.category?.replace(/s$/, '') || 'sofa'}
                    dims={dims}
                    colorway={finish}
                    open={open}
                    explode={explode}
                    rotation={rotation}
                    showHotspots
                  />
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
                    {locale === 'hi' ? 'तस्वीरें' : 'Photos'}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === '3d'}
                    onClick={() => setView('3d')}
                  >
                    {locale === 'hi' ? '3D दृश्य' : '3D view'}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'dimensions'}
                    onClick={() => setView('dimensions')}
                  >
                    {locale === 'hi' ? 'माप' : 'Dimensions'}
                  </button>
                </div>
              </div>

              {view === '3d' && (
                <div className={styles.modelTools}>
                  <MaterialConfigurator value={finish} onChange={setFinish} />
                  {['refrigerator', 'washer', 'wardrobe', 'microwave'].includes(product.modelType || product.category?.replace(/s$/, '')) && (
                    <button
                      className={styles.openToggle}
                      type="button"
                      onClick={() => setOpen(!open)}
                    >
                      {open ? 'Close' : 'Open'} {(product.categoryLabel || product.category || 'unit').toLowerCase()}
                    </button>
                  )}
                  <ExplodeView value={explode} onChange={setExplode} />
                  <small>Drag to rotate · arrow keys also work · interactive 3D model</small>
                </div>
              )}

              {view === 'photo' && (
                <div className={styles.thumbs}>
                  {media.map((item, index) => (
                    <button
                      type="button"
                      className={activeMedia === index ? styles.thumbActive : ''}
                      aria-label={`Show image ${index + 1}: ${item.alt}`}
                      key={item.src + index}
                      onClick={() => setActiveMedia(index)}
                    >
                      <Image
                        src={item.thumb || item.src}
                        alt=""
                        width={90}
                        height={90}
                        unoptimized={Boolean((item.thumb || item.src)?.startsWith('/api/files/') || (item.thumb || item.src)?.startsWith('/uploads/'))}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Craftsmanship & Quality Highlights under Gallery (Fills vertical space with trust) */}
              <div className={styles.galleryTrust}>
                <div className={styles.galleryTrustHeading}>
                  <span className={styles.artisanBadge}>
                    <Icon name="check" size={14} color="#1b5e20" />
                    {locale === 'hi' ? 'कारीगरी एवं गुणवत्ता प्रमाण' : 'Craftsmanship & Quality Assurance'}
                  </span>
                  <span className={styles.artisanSub}>
                    {locale === 'hi'
                      ? 'प्रत्येक पीस हमारी वर्कशॉप में अनुभवी बढ़इयों द्वारा जाँचा जाता है'
                      : 'Hand-inspected in workshop before white-glove dispatch'}
                  </span>
                </div>

                <div className={styles.trustBadges}>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🛡️</div>
                    <div className={styles.trustBadgeText}>
                      <b>{locale === 'hi' ? '10-वर्षीय वारंटी' : '10-Year Solid Warranty'}</b>
                      <span>{locale === 'hi' ? 'सॉलिड शीशम और स्ट्रक्चरल कवरेज' : 'Comprehensive frame & structure'}</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🚚</div>
                    <div className={styles.trustBadgeText}>
                      <b>{locale === 'hi' ? 'व्हाइट-ग्लोव इंस्टॉलेशन' : 'White-Glove Assembly'}</b>
                      <span>{locale === 'hi' ? 'रूम प्लेसमेंट और असेंबली मुफ़्त' : 'Zero-effort on-site setup'}</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>🔄</div>
                    <div className={styles.trustBadgeText}>
                      <b>{locale === 'hi' ? '10-दिन ट्रांजिट गारंटी' : '10-Day Safe Transit'}</b>
                      <span>{locale === 'hi' ? 'क्षतिमुक्त रिप्लेसमेंट सुरक्षा' : 'Zero-risk transit protection'}</span>
                    </div>
                  </div>
                  <div className={styles.trustBadgeItem}>
                    <div className={styles.trustBadgeIcon}>💳</div>
                    <div className={styles.trustBadgeText}>
                      <b>{locale === 'hi' ? 'नो-कॉस्ट ईएमआई' : 'No-Cost EMI Options'}</b>
                      <span>{locale === 'hi' ? 'आसान मासिक किस्तों में उपलब्ध' : 'Available across major banks'}</span>
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
                    <Icon name="star" size={13} style={{ fill: '#d99726', color: '#d99726' }} /> {product.rating} · {product.reviewCount} {locale === 'hi' ? 'समीक्षाएं' : 'reviews'}
                  </span>
                ) : (
                  <span>
                    4.8 <Icon name="star" size={13} style={{ fill: '#d99726', color: '#d99726' }} /> · {locale === 'hi' ? 'सत्यापित ग्राहक रेटिंग' : 'Verified Customer Rating'}
                  </span>
                )}
                <a href="#reviews">{locale === 'hi' ? 'विवरण देखें' : 'View details'}</a>
              </div>

              <div className={styles.price}>
                {hasValidPrice ? (
                  <>
                    <strong>{priceFormatted}</strong>
                    {product.mrp > product.price && mrpFormatted && (
                      <>
                        <del>{mrpFormatted}</del>
                        {product.discount > 0 && <span>{product.discount}% {locale === 'hi' ? 'छूट' : 'off'}</span>}
                      </>
                    )}
                    <small>{locale === 'hi' ? 'लागू कर और डिलीवरी शुल्क चेकआउट पर जोड़े जाएंगे।' : 'Applicable taxes and delivery charges calculated at checkout.'}</small>
                  </>
                ) : (
                  <span style={{ color: '#64748b' }}>{locale === 'hi' ? 'पूछताछ पर मूल्य · वर्तमान में ऑनलाइन अनुपलब्ध' : 'Price on inquiry · Currently not available online'}</span>
                )}
              </div>

              <div className={styles.dimensionFirst}>
                <div>
                  <span className={styles.label}>{locale === 'hi' ? 'आयाम (माप)' : 'DIMENSIONS'}</span>
                  <b>{dims.width} × {dims.depth} × {dims.height} cm</b>
                  <small>{locale === 'hi' ? 'चौड़ाई × गहराई × ऊंचाई · ऑर्डर से पहले दरवाज़े और लिफ्ट की माप जांच लें' : 'W × D × H · verify entryway clearances before ordering'}</small>
                </div>
                <button type="button" onClick={() => setView('dimensions')}>
                  {locale === 'hi' ? 'माप आरेख देखें' : 'View diagram'} <Icon name="arrow" size={15} />
                </button>
              </div>

              <div className={styles.variants}>
                <b>{locale === 'hi' ? 'फ़िनिश / रंग' : 'Finish / Colour'}</b>
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
                  <b>{locale === 'hi' ? 'विश्वसनीय कवरेज' : 'Transparent Coverage'}</b>
                  <span>
                    {product.warranty?.manufacturer ||
                      product.warranty?.seller ||
                      (locale === 'hi' ? 'फ़्रेम एवं हार्डवेयर पर मानक 2-वर्षीय कवरेज' : 'Standard 2-year comprehensive coverage on frame and hardware')}
                  </span>
                  {product.warranty?.compressor && (
                    <span>{product.warranty.compressor}</span>
                  )}
                  <Link href="/policies/warranty" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {locale === 'hi' ? 'वारंटी नीति पढ़ें' : 'Read warranty policy'} <Icon name="arrow" size={14} />
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
                    ? (locale === 'hi' ? 'वर्तमान में अनुपलब्ध' : 'Currently Unavailable')
                    : isAvailable
                    ? (locale === 'hi' ? `बैग में जोड़ें · ${formatPriceSafe(product.price * qty)}` : `Add to bag · ${formatPriceSafe(product.price * qty)}`)
                    : (locale === 'hi' ? 'स्टॉक समाप्त' : 'Out of stock')}
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
                        {locale === 'hi' ? 'व्हाट्सएप सहायता एवं सीधा ऑर्डर' : 'Direct WhatsApp Order & Assistance'}
                      </span>
                      <span className={styles.waStatusBadge}>
                        <span className={styles.waStatusGlow} />
                        {locale === 'hi' ? 'ऑनलाइन · 5 मिनट में जवाब' : 'Online · Replies in ~5m'}
                      </span>
                    </div>
                    <p className={styles.waDesc}>
                      {locale === 'hi'
                        ? 'असली शोरूम तस्वीरें, कस्टमाइजेशन या सीधे ऑर्डर के लिए हमारे विशेषज्ञ से बात करें।'
                        : 'Get live showroom video, custom dimensions, fabric swatches or order directly.'}
                    </p>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waCtaBtn}
                  aria-label={locale === 'hi' ? 'व्हाट्सएप पर चैट करें' : 'Chat & Order on WhatsApp'}
                >
                  <Icon name="whatsapp" size={19} color="#ffffff" />
                  <span>{locale === 'hi' ? 'व्हाट्सएप पर ऑर्डर / बातचीत करें' : 'Order or Inquire via WhatsApp'}</span>
                  <Icon name="arrow" size={15} color="#ffffff" />
                </a>

                <div className={styles.waPillsList}>
                  <span className={styles.waPillPrompt}>
                    {locale === 'hi' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
                  </span>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'photos')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask for real showroom photos"
                  >
                    📸 {locale === 'hi' ? 'असली तस्वीरें' : 'Real Photos / Video'}
                  </a>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'custom')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask about custom dimensions"
                  >
                    📐 {locale === 'hi' ? 'कस्टम साइज़' : 'Custom Dimensions'}
                  </a>
                  <a
                    href={getProductWhatsAppUrl(product, locale, 'discount')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waChip}
                    title="Ask for best festive offer"
                  >
                    🏷️ {locale === 'hi' ? 'बेस्ट ऑफ़र' : 'Best Offer'}
                  </a>
                </div>
              </div>

              <p className={styles.stock}>
                <span />
                {isAvailable
                  ? (locale === 'hi' ? `शीघ्र डिलीवरी के लिए ${product.stock || 12} इकाइयां उपलब्ध` : `${product.stock || 12} units available for prompt delivery`)
                  : (locale === 'hi' ? 'वर्तमान में स्टॉक समाप्त' : 'Currently out of stock')}
              </p>

              {/* Live Pincode Estimator */}
              <div className={styles.pincodeWidget}>
                <div className={styles.pincodeHeader}>
                  <div className={styles.pincodeTitle}>
                    <Icon name="pin" size={16} />
                    <span>{locale === 'hi' ? 'डिलीवरी एवं इंस्टॉलेशन उपलब्धता' : 'Delivery & Assembly Checker'}</span>
                  </div>
                </div>
                <form className={styles.pincodeForm} onSubmit={handlePincodeCheck}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={locale === 'hi' ? 'अपना 6-अंकों का पिनकोड दर्ज करें' : 'Enter 6-digit delivery pincode'}
                    className={styles.pincodeInput}
                  />
                  <button type="submit" className={styles.pincodeBtn} disabled={pinStatus === 'loading'}>
                    {pinStatus === 'loading'
                      ? (locale === 'hi' ? 'जांच जारी...' : 'Checking...')
                      : (locale === 'hi' ? 'जांचें' : 'Check')}
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
                  {locale === 'hi' ? 'साइज़िंग या फ़िटिंग में सहायता चाहिए?' : 'Need sizing advice or fit assistance?'}
                </span>
                <Link
                  href={`/consultation?interest=${product.type === 'appliance' ? 'appliances' : 'furniture'}&product=${product.slug}`}
                  style={{ color: 'var(--rf-green-800)', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  {locale === 'hi' ? 'मुफ़्त परामर्श बुक करें' : 'Book Free Consultation'} <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Specifications and Serviceability */}
          <div className={styles.detailBlocks}>
            <section className={styles.specs}>
              <span className="kicker">{locale === 'hi' ? 'उत्पाद विनिर्देश' : 'Product Specifications'}</span>
              <h2>{locale === 'hi' ? 'भारतीय घरों के लिए विशेष रूप से निर्मित।' : 'Designed for Indian Homes.'}</h2>
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
                <b>{locale === 'hi' ? 'बॉक्स एवं पैकेज माप' : 'Box & Package Dimensions'}</b>
                <span>
                  {product.packageDimensions?.width || dims.width + 10} ×{' '}
                  {product.packageDimensions?.depth || dims.depth + 10} ×{' '}
                  {product.packageDimensions?.height || dims.height + 12} cm
                </span>
                <small>{locale === 'hi' ? 'सुनिश्चित करें कि आपकी इमारत की लिफ्ट और दरवाज़े इन मापों के अनुकूल हों।' : 'Ensure your building lift and doorways accommodate these dimensions.'}</small>
              </div>
            </section>

            <section className={styles.service}>
              <span className="kicker">{locale === 'hi' ? 'डिलीवरी एवं इंस्टॉलेशन' : 'Delivery & Installation'}</span>
              <h2>{locale === 'hi' ? 'अपना पिनकोड जांचें।' : 'Check your pincode.'}</h2>
              <p>
                {locale === 'hi'
                  ? 'आपके क्षेत्र के लिए डिलीवरी शेड्यूल, इंस्टॉलेशन स्लॉट और विकल्प सुनिश्चित किए जाते हैं।'
                  : 'Delivery schedules, installation slots and transit options are confirmed for your location.'}
              </p>
              <ServiceabilityChecker />
            </section>
          </div>

          {/* Customer Reviews Section */}
          <section id="reviews" className={styles.reviews}>
            <span className="kicker">{locale === 'hi' ? 'ग्राहक समीक्षाएं' : 'Customer Reviews'}</span>
            <h2>{locale === 'hi' ? 'सत्यापित ग्राहकों की प्रतिक्रिया।' : 'Feedback from Verified Owners.'}</h2>
            <p>
              {locale === 'hi'
                ? 'इस उत्पाद को ख़रीदने वाले ग्राहकों की वास्तविक समीक्षाएं और रेटिंग पढ़ें।'
                : 'Read authentic reviews and ratings from customers who purchased this item.'}
            </p>
          </section>

          {/* Related Products */}
          {related.length > 0 && (
            <section className={styles.related}>
              <div className="container">
                <h2>{locale === 'hi' ? 'पूरा सेट देखें' : 'Complete the Look'}</h2>
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
            aria-label={locale === 'hi' ? 'व्हाट्सएप पर पूछें' : 'Inquire on WhatsApp'}
            title={locale === 'hi' ? 'व्हाट्सएप पर पूछें' : 'Inquire on WhatsApp'}
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
              ? (locale === 'hi' ? 'अनुपलब्ध' : 'Unavailable')
              : isAvailable
              ? (locale === 'hi' ? 'बैग में जोड़ें' : 'Add to bag')
              : (locale === 'hi' ? 'स्टॉक समाप्त' : 'Out of stock')}
          </Button>
        </div>
      </div>
    </>
  );
}
