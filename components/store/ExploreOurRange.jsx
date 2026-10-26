'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { getDemoProducts } from '@/lib/demo-data';
import styles from './ExploreOurRange.module.css';

const DEPARTMENT_CONFIG = {
  furniture: {
    key: 'furniture',
    label: 'Furnitures',
    avatar: '/images/products/aarav-l-shape-sectional-living-sofa-set/front.webp',
    href: '/furniture',
    circles: [
      {
        slug: 'all',
        name: 'All Furniture',
        image: '/images/room-living.webp'
      },
      {
        slug: 'sofa-set',
        name: 'Sofa Set',
        image: '/images/products/aarav-l-shape-sectional-living-sofa-set/front.webp'
      },
      {
        slug: 'double-bed',
        name: 'Double Bed',
        image: '/images/products/avani-sheesham-wood-queen-double-bed/front.webp'
      },
      {
        slug: 'wooden-wordrobe',
        name: 'Wardrobe',
        image: '/images/products/arohi-3-door-sheesham-wardrobe/front.webp'
      },
      {
        slug: 'fancy-almirah',
        name: 'Fancy Almirah',
        image: '/images/products/decora-laser-cut-decorative-glass-almirah/decora-fancy-front.webp'
      },
      {
        slug: 'almirah',
        name: 'Steel Almirah',
        image: '/images/products/riddhy-supreme-double-door-steel-almirah/riddhy-supreme-steel-front.webp'
      },
      {
        slug: 'centre-table',
        name: 'Centre Table',
        image: '/images/products/aarohan-oval-wooden-coffee-centre-table/front.webp'
      },
      {
        slug: 'mattress',
        name: 'Mattress',
        image: '/images/products/sukoon-high-density-coir-foam-mattress/front.webp'
      }
    ]
  },
  appliances: {
    key: 'appliances',
    label: 'Appliances',
    avatar: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp',
    href: '/appliances',
    circles: [
      {
        slug: 'all',
        name: 'All Appliances',
        image: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp'
      },
      {
        slug: 'fridge',
        name: 'Refrigerator',
        image: '/images/products/aarohan-340l-convertible-5-in-1-triple-door-fridge/front.webp'
      },
      {
        slug: 'washing-machine',
        name: 'Washing Machine',
        image: '/images/products/aarohan-7-5kg-smart-top-load-washing-machine/front.webp'
      },
      {
        slug: 'cooler',
        name: 'Desert Cooler',
        image: '/images/products/kisan-gold-diacut-commercial-body-air-cooler/front.webp'
      },
      {
        slug: 'gas-chulha',
        name: 'Gas Stove',
        image: '/images/products/prestige-3-burner-toughened-black-glass-gas-stove/front.webp'
      },
      {
        slug: 'mixer',
        name: 'Mixer Grinder',
        image: '/images/products/bajaj-classic-750w-4-jar-kitchen-mixer-grinder/front.webp'
      },
      {
        slug: 'iron',
        name: 'Iron (Press)',
        image: '/images/products/bajaj-majesty-non-stick-golden-soleplate-dry-iron/front.webp'
      },
      {
        slug: 'utensils-washer',
        name: 'Dishwasher',
        image: '/images/products/bosch-serie-6-free-standing-hygiene-utensil-washer/front.webp'
      }
    ]
  },
  utensils: {
    key: 'utensils',
    label: 'Utensils',
    avatar: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp',
    href: '/utensils',
    circles: [
      {
        slug: 'all',
        name: 'All Utensils',
        image: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp'
      },
      {
        slug: 'dinner-set',
        name: 'Dinner Sets',
        image: '/images/products/riddhy-royal-61-piece-stainless-steel-heavy-dinner-set/front.webp'
      },
      {
        slug: 'pressure-cooker',
        name: 'Pressure Cooker',
        image: '/images/products/hawkins-contura-hard-anodized-5l-3l-pressure-cooker-combo/front.webp'
      },
      {
        slug: 'kadai-frypan',
        name: 'Kadai & Fry Pan',
        image: '/images/products/bergner-tri-ply-2-5l-heavy-stainless-steel-kadai-with-glass-lid/front.webp'
      },
      {
        slug: 'roti-tawa',
        name: 'Roti & Dosa Tawa',
        image: '/images/products/hawkins-futura-28cm-hard-anodized-concave-roti-tawa/front.webp'
      },
      {
        slug: 'thali-set',
        name: 'Thali Set',
        image: '/images/products/mirror-finish-heavy-ss-304-maharaja-thali-set/front.webp'
      },
      {
        slug: 'casserole-set',
        name: 'Hotpot Casserole',
        image: '/images/products/cello-chef-deluxe-thermal-hotpot-food-warmer-gift-set/front.webp'
      },
      {
        slug: 'water-jug',
        name: 'Water Jug Set',
        image: '/images/products/floral-embossed-royal-steel-water-jug-tumbler-7-piece-set/front.webp'
      }
    ]
  }
};

export default function ExploreOurRange({ allProducts = [], initialDept = 'furniture' }) {
  const [activeDept, setActiveDept] = useState(initialDept);
  const [activeCategory, setActiveCategory] = useState('all');

  const deptData = DEPARTMENT_CONFIG[activeDept] || DEPARTMENT_CONFIG.furniture;

  // Use passed products if available, otherwise fall back to full demo products
  const productsList = useMemo(() => {
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      return allProducts;
    }
    return getDemoProducts();
  }, [allProducts]);

  // Switch department: also reset active category to 'all'
  const handleDeptChange = (deptKey) => {
    setActiveDept(deptKey);
    setActiveCategory('all');
  };

  // Filter products for the current selection
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productsList) || productsList.length === 0) return [];

    const deptType = activeDept === 'appliances' ? 'appliance' : activeDept;

    if (activeCategory === 'all') {
      // Return top products of this entire department
      return productsList
        .filter((p) => p.type === deptType || p.type === activeDept)
        .slice(0, 8);
    }

    // Filter by specific category slug or label or modelType
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
      return matching.slice(0, 8);
    }

    // If no exact category match, fallback to department items
    return productsList
      .filter((p) => p.type === deptType || p.type === activeDept)
      .slice(0, 8);
  }, [productsList, activeDept, activeCategory]);

  const shopMoreHref = useMemo(() => {
    if (activeCategory && activeCategory !== 'all') {
      return `/${activeDept}/${activeCategory}`;
    }
    return deptData.href;
  }, [activeDept, activeCategory, deptData.href]);

  return (
    <section className={styles.section} aria-label="Explore Our Range">
      <div className={styles.container}>
        {/* Top Header Row: Explore Our Range on Left, Shop More Button on Right */}
        <div className={styles.headerRow}>
          <h2 className={styles.title}>
            Explore Our{' '}
            <span className={styles.rangeHighlight}>
              Range
              <svg
                className={styles.brushStroke}
                viewBox="0 0 140 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8.5C36 3.5 102 3 137 7.5"
                  stroke="#e0a040"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 10C50 6.5 98 6.5 125 9.5"
                  stroke="#c48620"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <Link href={shopMoreHref} className={styles.shopMoreBtn}>
            <span>Shop More</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Department Switcher Tabs with Real Avatar Images */}
        <div className={styles.deptTabs} role="tablist" aria-label="Department Categories">
          {Object.values(DEPARTMENT_CONFIG).map((dept) => {
            const isActive = activeDept === dept.key;
            return (
              <button
                key={dept.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.deptTab} ${isActive ? styles.deptTabActive : ''}`}
                onClick={() => handleDeptChange(dept.key)}
              >
                <span className={styles.deptAvatarWrap}>
                  <Image
                    src={dept.avatar}
                    alt={dept.label}
                    fill
                    sizes="30px"
                    className={styles.deptAvatarImg}
                    unoptimized
                  />
                </span>
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circular Categories Filter Bar with Actual Product Photography */}
        <div className={styles.circlesWrapper}>
          <div className={styles.circlesRow} role="tablist" aria-label={`${deptData.label} category filter`}>
            {deptData.circles.map((circle) => {
              const isActive = activeCategory === circle.slug;
              return (
                <button
                  key={circle.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.circleCard} ${isActive ? styles.circleCardActive : ''}`}
                  onClick={() => setActiveCategory(circle.slug)}
                >
                  <div className={styles.circleImgWrap}>
                    <div className={styles.circleImgInner}>
                      <Image
                        src={circle.image}
                        alt={circle.name}
                        fill
                        sizes="92px"
                        className={styles.circleImg}
                        unoptimized
                      />
                    </div>
                  </div>
                  <span className={styles.circleLabel}>{circle.name}</span>
                  {isActive ? (
                    <div className={styles.activeIndicator} />
                  ) : (
                    <div className={styles.indicatorPlaceholder} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid (4 Columns matching Harivan Organics) */}
        <div className={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))
          ) : (
            <div className={styles.emptyState}>
              No pieces currently in this selection. Explore all {deptData.label} in our catalog.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
