'use client';

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import styles from './ExploreOurRange.module.css';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const DEPARTMENT_CONFIG = {
  furniture: {
    key: 'furniture',
    label: 'Furnitures',
    avatar: '/images/products/aarav-l-shape-sectional-living-sofa-set/front.webp',
    href: '/furniture',
    circles: [
      { slug: 'all', name: 'All Furniture', image: '/images/room-living.webp' },
      { slug: 'sofa-set', name: 'Sofa Set', image: '/images/products/aarav-l-shape-sectional-living-sofa-set/front.webp' },
      { slug: 'double-bed', name: 'Double Bed', image: '/images/products/avani-sheesham-wood-queen-double-bed/front.webp' },
      { slug: 'wooden-wordrobe', name: 'Wardrobe', image: '/images/products/arohi-3-door-sheesham-wardrobe/front.webp' },
      { slug: 'fancy-almirah', name: 'Fancy Almirah', image: '/images/products/decora-laser-cut-decorative-glass-almirah/decora-fancy-front.webp' },
      { slug: 'almirah', name: 'Steel Almirah', image: '/images/products/riddhy-supreme-double-door-steel-almirah/riddhy-supreme-steel-front.webp' },
      { slug: 'centre-table', name: 'Centre Table', image: '/images/products/aarohan-oval-wooden-coffee-centre-table/front.webp' },
      { slug: 'mattress', name: 'Mattress', image: '/images/products/sukoon-high-density-coir-foam-mattress/front.webp' }
    ]
  },
  appliances: {
    key: 'appliances',
    label: 'Appliances',
    avatar: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp',
    href: '/appliances',
    circles: [
      { slug: 'all', name: 'All Appliances', image: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp' },
      { slug: 'fridge', name: 'Refrigerator', image: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp' },
      { slug: 'washing-machine', name: 'Washing Machine', image: '/images/products/aarohan-7-5kg-smart-top-load-washing-machine/front.webp' },
      { slug: 'cooler', name: 'Desert Cooler', image: '/images/products/kisan-gold-diacut-commercial-body-air-cooler/front.webp' },
      { slug: 'gas-chulha', name: 'Gas Stove', image: '/images/products/prestige-3-burner-toughened-black-glass-gas-stove/front.webp' },
      { slug: 'mixer', name: 'Mixer Grinder', image: '/images/products/bajaj-classic-750w-4-jar-kitchen-mixer-grinder/front.webp' },
      { slug: 'iron', name: 'Iron (Press)', image: '/images/products/bajaj-majesty-non-stick-golden-soleplate-dry-iron/front.webp' },
      { slug: 'utensils-washer', name: 'Dishwasher', image: '/images/products/bosch-serie-6-free-standing-hygiene-utensil-washer/front.webp' }
    ]
  },
  utensils: {
    key: 'utensils',
    label: 'Utensils',
    avatar: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp',
    href: '/utensils',
    circles: [
      { slug: 'all', name: 'All Utensils', image: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp' },
      { slug: 'dinner-set', name: 'Dinner Sets', image: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp' },
      { slug: 'pressure-cooker', name: 'Pressure Cooker', image: '/images/products/hawkins-contura-hard-anodized-5l-3l-pressure-cooker-combo/front.webp' },
      { slug: 'kadai-frypan', name: 'Kadai & Fry Pan', image: '/images/products/bergner-tri-ply-2-5l-heavy-stainless-steel-kadai-with-glass-lid/front.webp' },
      { slug: 'roti-tawa', name: 'Roti & Dosa Tawa', image: '/images/products/hawkins-futura-28cm-hard-anodized-concave-roti-tawa/front.webp' },
      { slug: 'thali-set', name: 'Thali Set', image: '/images/products/mirror-finish-heavy-ss-304-maharaja-thali-set/front.webp' },
      { slug: 'casserole-set', name: 'Hotpot Casserole', image: '/images/products/cello-chef-deluxe-thermal-hotpot-food-warmer-gift-set/front.webp' },
      { slug: 'water-jug', name: 'Water Jug Set', image: '/images/products/floral-embossed-royal-steel-water-jug-tumbler-7-piece-set/front.webp' }
    ]
  }
};

const PRODUCT_DISPLAY_LIMIT = 6;

export default function ExploreOurRange({ allProducts = [], categories = [], initialDept = 'furniture' }) {
  const [activeDept, setActiveDept] = useState(initialDept);
  const [activeCategory, setActiveCategory] = useState('all');
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(categories || []);

  /* ---------------- Fancy UI state (no functional impact) ---------------- */
  const pillTrackRef = useRef(null);
  const pillRefs = useRef({});
  const [capsule, setCapsule] = useState({ x: 0, width: 0, ready: false });
  const [stardust, setStardust] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1.6 + Math.random() * 2.8,
      delay: Math.random() * 7,
      duration: 4.5 + Math.random() * 5.5
    }));
    setStardust(items);
  }, []);

  const measureCapsule = useCallback(() => {
    const track = pillTrackRef.current;
    const activeEl = pillRefs.current[activeDept];
    if (!track || !activeEl) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setCapsule({
      x: elRect.left - trackRect.left + track.scrollLeft,
      width: elRect.width,
      ready: true
    });
  }, [activeDept]);

  useIsoLayoutEffect(() => {
    measureCapsule();
  }, [measureCapsule]);

  useEffect(() => {
    const onResize = () => measureCapsule();
    window.addEventListener('resize', onResize);
    const t = setTimeout(measureCapsule, 60);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, [measureCapsule]);
  /* ------------------------------------------------------------------- */

  const legacyAliases = useMemo(
    () =>
      new Set([
        'sofas', 'beds', 'wardrobes', 'dining-sets', 'study-tables', 'mattresses', 'decor', 'storage',
        'refrigerators', 'washing-machines', 'air-conditioners', 'televisions', 'microwaves', 'chimneys', 'water-purifiers'
      ]),
    []
  );

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesList(categories);
    } else {
      fetch('/api/categories')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
            setCategoriesList(json.data);
          }
        })
        .catch(() => { });
    }
  }, [categories]);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      fetch('/api/products?limit=50')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          const items = json?.data?.items || json?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setFetchedProducts(items);
          }
        })
        .catch(() => { });
    }
  }, [allProducts]);

  const deptData = useMemo(() => {
    const base = DEPARTMENT_CONFIG[activeDept] || DEPARTMENT_CONFIG.furniture;
    if (!categoriesList || categoriesList.length === 0) return base;

    const deptType = activeDept === 'appliances' ? 'appliance' : activeDept;
    const backendCategories = categoriesList.filter(
      (c) =>
        (c.type === deptType || (activeDept === 'appliances' && c.type === 'appliances')) &&
        c.active !== false &&
        !legacyAliases.has(c.slug)
    );

    if (backendCategories.length === 0) return base;

    const allCircle = base.circles[0] || {
      slug: 'all',
      name: `All ${base.label}`,
      image: backendCategories[0]?.image || base.avatar
    };

    const dynamicCircles = [
      allCircle,
      ...backendCategories.map((c) => ({
        slug: c.slug,
        name: c.name,
        image: c.image || base.avatar
      }))
    ];

    return {
      ...base,
      avatar: backendCategories[0]?.image || base.avatar,
      circles: dynamicCircles
    };
  }, [activeDept, categoriesList, legacyAliases]);

  const productsList = useMemo(() => {
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      return allProducts;
    }
    return fetchedProducts;
  }, [allProducts, fetchedProducts]);

  const handleDeptChange = (deptKey) => {
    setActiveDept(deptKey);
    setActiveCategory('all');
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productsList) || productsList.length === 0) return [];

    const deptType = activeDept === 'appliances' ? 'appliance' : activeDept;

    if (activeCategory === 'all') {
      return productsList
        .filter((p) => p.type === deptType || p.type === activeDept)
        .slice(0, PRODUCT_DISPLAY_LIMIT);
    }

    const target = activeCategory.toLowerCase();
    const matching = productsList.filter((p) => {
      const matchType = !p.type || p.type === deptType || p.type === activeDept;
      if (!matchType) return false;

      const cat = String(p.category || '').toLowerCase();
      const catSlug = String(p.categorySlug || '').toLowerCase();
      const catLabel = String(p.categoryLabel || '').toLowerCase();
      const model = String(p.modelType || '').toLowerCase();

      return (
        cat === target ||
        catSlug === target ||
        catLabel === target ||
        model === target ||
        cat.replace(/-/g, '') === target.replace(/-/g, '') ||
        cat.includes(target) ||
        target.includes(cat)
      );
    });

    if (matching.length > 0) {
      return matching.slice(0, PRODUCT_DISPLAY_LIMIT);
    }

    return productsList
      .filter((p) => p.type === deptType || p.type === activeDept)
      .slice(0, PRODUCT_DISPLAY_LIMIT);
  }, [productsList, activeDept, activeCategory]);

  const shopMoreHref = useMemo(() => {
    if (activeCategory && activeCategory !== 'all') {
      return `/${activeDept}/${activeCategory}`;
    }
    return deptData.href;
  }, [activeDept, activeCategory, deptData.href]);

  return (
    <section className={styles.rangeCosmosSection} aria-label="Explore Our Range">
      {/* Festive ambient layer — soft sparkle spread evenly, background only */}
      <div className={styles.festiveAuroraField} aria-hidden="true">
        <div className={styles.auroraOrbTopLeft} />
        <div className={styles.auroraOrbTopRight} />
        <div className={styles.auroraOrbCenter} />
        <div className={styles.auroraOrbBottomLeft} />
        <div className={styles.auroraOrbBottomRight} />
        {stardust.map((s) => (
          <span
            key={s.id}
            className={styles.stardustParticle}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`
            }}
          />
        ))}
      </div>

      <div className={styles.rangeContentStage}>
        {/* Centered Headline */}
        <div className={styles.rangeHeadlineBar}>
          <span className={styles.headlineFlourishLeft} aria-hidden="true" />
          <h2 className={styles.rangeHeadlineText}>
            Explore Our{' '}
            <span className={styles.rangeWordAccent}>
              Range
              <svg className={styles.accentBrushSvg} viewBox="0 0 140 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8.5C36 3.5 102 3 137 7.5" stroke="#e0a040" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M18 10C50 6.5 98 6.5 125 9.5" stroke="#c48620" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <span className={styles.headlineFlourishRight} aria-hidden="true" />
        </div>

        {/* Department Pills — premium sliding glass capsule indicator */}
        <div className={styles.departmentOrbitStage}>
          <div
            className={styles.departmentPillTrack}
            ref={pillTrackRef}
            role="tablist"
            aria-label="Department Categories"
          >
            {capsule.ready && (
              <span
                className={styles.slidingCapsule}
                style={{
                  transform: `translateX(${capsule.x}px)`,
                  width: `${capsule.width}px`
                }}
                aria-hidden="true"
              >
                <span className={styles.capsuleShine} />
                <span className={styles.capsuleGlowHalo} />
              </span>
            )}

            {Object.values(DEPARTMENT_CONFIG).map((dept) => {
              const isActive = activeDept === dept.key;
              return (
                <button
                  key={dept.key}
                  ref={(el) => {
                    pillRefs.current[dept.key] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.departmentPillItem} ${isActive ? styles.departmentPillItemLive : ''}`}
                  onClick={() => handleDeptChange(dept.key)}
                >
                  <span className={styles.departmentPillText}>{dept.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Circular Sub-Categories — default clean font, fixed size, ellipsis truncation */}
        <div className={styles.categoryOrbitDeck}>
          <div className={styles.orbitFadeEdgeStart} aria-hidden="true" />
          <div className={styles.orbitFadeEdgeEnd} aria-hidden="true" />
          <div className={styles.categoryOrbitTrack} role="tablist" aria-label={`${deptData.label} category filter`}>
            {deptData.circles.map((circle, idx) => {
              const isActive = activeCategory === circle.slug;
              return (
                <button
                  key={circle.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.categoryOrbItem} ${isActive ? styles.categoryOrbItemLive : ''}`}
                  style={{ '--delay': `${idx * 0.06}s` }}
                  onClick={() => setActiveCategory(circle.slug)}
                  title={circle.name}
                >
                  <div className={styles.categoryOrbFrame}>
                    <span className={styles.categoryOrbHaloSpin} />
                    <div className={styles.categoryOrbPortal}>
                      <div className={styles.categoryOrbPortalInner}>
                        <Image
                          src={circle.image}
                          alt={circle.name}
                          fill
                          sizes="92px"
                          className={styles.categoryOrbPhoto}
                          unoptimized
                        />
                        <span className={styles.categoryOrbGlint} />
                      </div>
                    </div>
                  </div>
                  <span className={styles.categoryOrbCaption}>{circle.name}</span>
                  {isActive ? (
                    <div className={styles.categoryOrbUnderline} />
                  ) : (
                    <div className={styles.categoryOrbUnderlineGhost} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid — UNCHANGED FUNCTIONALITY, capped at 6 */}
        <div className={styles.curatedShowcaseGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))
          ) : (
            <div className={styles.showcaseEmptyNotice}>
              No pieces currently in this selection. Explore all {deptData.label} in our catalog.
            </div>
          )}
        </div>

        {/* Shop More — below grid, centered */}
        <div className={styles.rangeFooterCtaRow}>
          <Link href={shopMoreHref} className={styles.exploreMoreCta}>

            <span>Shop More</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}