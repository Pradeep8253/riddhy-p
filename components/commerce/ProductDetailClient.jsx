'use client';

import { useMemo, useState } from 'react';
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
import MaterialConfigurator from '@/components/three/MaterialConfigurator';
import ExplodeView from '@/components/three/ExplodeView';
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
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const wishlisted = useSelector((state) => Boolean(state.auth?.isAuthenticated && state.wishlist.items.some((item) => item.slug === product.slug)));

  const [activeMedia, setActiveMedia] = useState(0);
  const [view, setView] = useState('photo');
  const [qty, setQty] = useState(1);
  const [finish, setFinish] = useState(defaultSwatches[0]);
  const [open, setOpen] = useState(false);
  const [explode, setExplode] = useState(0);
  const [rotation, setRotation] = useState([0, 0, 0]);

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
                    Photos
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === '3d'}
                    onClick={() => setView('3d')}
                  >
                    3D view
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
            </div>

            {/* Product Info Section */}
            <div className={styles.info}>
              <div className={styles.brand}>
                {product.brand || 'RF Riddhy'} <span>·</span> {product.categoryLabel || product.category}
              </div>

              <h1>{product.name}</h1>
              {product.tagline && <p className={styles.tagline}>{product.tagline}</p>}

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
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={wishlisted}
                  title={wishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                >
                  <Icon name="heart" size={20} />
                </button>
              </div>

              <p className={styles.stock}>
                <span />
                {isAvailable
                  ? `${product.stock || 12} units available for prompt delivery`
                  : 'Currently out of stock'}
              </p>

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
        <div>
          <b>{product.name}</b>
          <span>{formatINR(product.price)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className={styles.stickyWishlistBtn}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
            title={wishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
          >
            <Icon name="heart" size={18} />
          </button>
          <Button
            onClick={handleAddToCart}
            size="sm"
            disabled={!isAvailable}
          >
            {isAvailable ? 'Add to bag' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </>
  );
}
