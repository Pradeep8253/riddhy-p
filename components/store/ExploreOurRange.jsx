"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./ExploreOurRange.module.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PRODUCT_DISPLAY_LIMIT = 6;

const DEPARTMENTS = [
  {
    key: "furniture",
    label: "Furnitures",
    href: "/furniture",
    type: "furniture",
    fallbackImage: "/images/category-double-bed.webp",
  },
  {
    key: "appliances",
    label: "Appliances",
    href: "/appliances",
    type: "appliance",
    fallbackImage: "/images/category-fridge.webp",
  },
  {
    key: "utensils",
    label: "Utensils",
    href: "/utensils",
    type: "utensils",
    fallbackImage: "/images/category-dinner-set.webp",
  },
];

export default function ExploreOurRange({
  allProducts = [],
  categories = [],
  initialDept = "furniture",
}) {
  const [activeDept, setActiveDept] = useState(initialDept);
  const [activeCategory, setActiveCategory] = useState("all");
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(categories || []);

  /* ---------------- Fancy UI state (aurora stardust & pill capsule) ---------------- */
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
      duration: 4.5 + Math.random() * 5.5,
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
      ready: true,
    });
  }, [activeDept]);

  useIsoLayoutEffect(() => {
    measureCapsule();
  }, [measureCapsule]);

  useEffect(() => {
    const onResize = () => measureCapsule();
    window.addEventListener("resize", onResize);
    const t = setTimeout(measureCapsule, 60);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [measureCapsule]);
  /* ------------------------------------------------------------------- */

  const legacyAliases = useMemo(
    () =>
      new Set([
        "sofas",
        "beds",
        "wardrobes",
        "dining-sets",
        "study-tables",
        "mattresses",
        "decor",
        "storage",
        "refrigerators",
        "washing-machines",
        "air-conditioners",
        "televisions",
        "microwaves",
        "chimneys",
        "water-purifiers",
      ]),
    [],
  );

  // Sync or fetch dynamic categories from backend
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesList(categories);
    } else {
      fetch("/api/categories")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (
            json?.success &&
            Array.isArray(json?.data) &&
            json.data.length > 0
          ) {
            setCategoriesList(json.data);
          }
        })
        .catch(() => {});
    }
  }, [categories]);

  // Sync or fetch dynamic products from backend
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      fetch("/api/products?limit=50")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          const items = json?.data?.items || json?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setFetchedProducts(items);
          }
        })
        .catch(() => {});
    }
  }, [allProducts]);

  const activeDeptObj = useMemo(() => {
    return DEPARTMENTS.find((d) => d.key === activeDept) || DEPARTMENTS[0];
  }, [activeDept]);

  // Categories belonging to current active department, sorted by backend sortOrder
  const deptCategories = useMemo(() => {
    if (!Array.isArray(categoriesList) || categoriesList.length === 0) return [];
    const deptType = activeDeptObj.type;

    return categoriesList
      .filter((c) => {
        if (c.active === false || c.isDeleted) return false;
        if (legacyAliases.has(c.slug)) return false;
        if (activeDept === "appliances") {
          return c.type === "appliance" || c.type === "appliances";
        }
        return c.type === deptType;
      })
      .sort((a, b) => {
        const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 999;
        const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 999;
        return orderA - orderB;
      });
  }, [categoriesList, activeDept, activeDeptObj, legacyAliases]);

  // Circular navigation items: First is "All [Dept]", then backend categories
  const circles = useMemo(() => {
    const allCircle = {
      slug: "all",
      name: `All ${activeDeptObj.label}`,
      image: deptCategories[0]?.image || activeDeptObj.fallbackImage,
    };

    const dynamicCircles = deptCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      image: c.image || activeDeptObj.fallbackImage,
    }));

    return [allCircle, ...dynamicCircles];
  }, [deptCategories, activeDeptObj]);

  const productsList = useMemo(() => {
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      return allProducts;
    }
    return fetchedProducts;
  }, [allProducts, fetchedProducts]);

  const handleDeptChange = (deptKey) => {
    setActiveDept(deptKey);
    setActiveCategory("all");
  };

  // Lookup map for category sort priority (used for "All" tab view)
  const categoryOrderMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(categoriesList)) {
      categoriesList.forEach((c) => {
        if (c.slug && typeof c.sortOrder === "number") {
          map.set(c.slug.toLowerCase(), c.sortOrder);
          map.set(c.slug.toLowerCase().replace(/s$/, ""), c.sortOrder);
        }
      });
    }
    // Canonical fallbacks
    const aliases = {
      beds: 1,
      "double-bed": 1,
      sringardan: 2,
      sofas: 3,
      "sofa-set": 3,
      "centre-table": 4,
      wardrobes: 5,
      "wooden-wordrobe": 5,
      almirah: 6,
      "fancy-almirah": 7,
      mattresses: 8,
      mattress: 8,
      "washing-machines": 29,
      "washing-machine": 29,
      refrigerators: 30,
      fridge: 30,
    };
    for (const [k, v] of Object.entries(aliases)) {
      if (!map.has(k)) map.set(k, v);
    }
    return map;
  }, [categoriesList]);

  // Curated showcase products capped at 6
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productsList) || productsList.length === 0) return [];

    const deptType = activeDept === "appliances" ? "appliance" : activeDept;
    const deptProducts = productsList.filter(
      (p) => !p.type || p.type === deptType || p.type === activeDept,
    );

    if (activeCategory === "all") {
      const getOrder = (p) => {
        const cat = String(p.category || "").toLowerCase();
        const catSlug = String(p.categorySlug || "").toLowerCase();
        if (categoryOrderMap.has(cat)) return categoryOrderMap.get(cat);
        if (categoryOrderMap.has(catSlug)) return categoryOrderMap.get(catSlug);
        return 999;
      };

      const sorted = [...deptProducts].sort((a, b) => getOrder(a) - getOrder(b));
      const result = [];
      const seenCategories = new Set();

      // Showcase a diverse selection across top categories
      for (const p of sorted) {
        const cat = p.category;
        if (!seenCategories.has(cat)) {
          seenCategories.add(cat);
          result.push(p);
          if (result.length >= PRODUCT_DISPLAY_LIMIT) break;
        }
      }
      // If fewer than limit, fill with remaining products
      if (result.length < PRODUCT_DISPLAY_LIMIT) {
        for (const p of sorted) {
          if (!result.includes(p)) {
            result.push(p);
            if (result.length >= PRODUCT_DISPLAY_LIMIT) break;
          }
        }
      }
      return result;
    }

    // Specific category filter
    const target = activeCategory.toLowerCase();
    const matching = deptProducts.filter((p) => {
      const cat = String(p.category || "").toLowerCase();
      const catSlug = String(p.categorySlug || "").toLowerCase();
      const catLabel = String(p.categoryLabel || "").toLowerCase();
      const model = String(p.modelType || "").toLowerCase();

      return (
        cat === target ||
        catSlug === target ||
        catLabel === target ||
        model === target ||
        cat.replace(/-/g, "") === target.replace(/-/g, "") ||
        cat.replace(/s$/, "") === target.replace(/s$/, "") ||
        target.replace(/s$/, "") === cat.replace(/s$/, "") ||
        cat.includes(target) ||
        target.includes(cat)
      );
    });

    if (matching.length > 0) {
      return matching.slice(0, PRODUCT_DISPLAY_LIMIT);
    }

    return deptProducts.slice(0, PRODUCT_DISPLAY_LIMIT);
  }, [productsList, activeDept, activeCategory, categoryOrderMap]);

  const shopMoreHref = useMemo(() => {
    if (activeCategory && activeCategory !== "all") {
      return `/${activeDept}/${activeCategory}`;
    }
    return activeDeptObj.href;
  }, [activeDept, activeCategory, activeDeptObj.href]);

  return (
    <section
      className={styles.rangeCosmosSection}
      aria-label="Explore Our Range"
    >
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
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.rangeContentStage}>
        {/* Centered Headline */}
        <div className={styles.rangeHeadlineBar}>
          <span className={styles.headlineFlourishLeft} aria-hidden="true" />
          <h2 className={styles.rangeHeadlineText}>
            Explore Our{" "}
            <span className={styles.rangeWordAccent}>
              Range
              <svg
                className={styles.accentBrushSvg}
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
                  width: `${capsule.width}px`,
                }}
                aria-hidden="true"
              >
                <span className={styles.capsuleShine} />
                <span className={styles.capsuleGlowHalo} />
              </span>
            )}

            {DEPARTMENTS.map((dept) => {
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
                  className={`${styles.departmentPillItem} ${isActive ? styles.departmentPillItemLive : ""}`}
                  onClick={() => handleDeptChange(dept.key)}
                >
                  <span className={styles.departmentPillText}>
                    {dept.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Circular Sub-Categories — dynamically populated from backend categories */}
        <div className={styles.categoryOrbitDeck}>
          <div className={styles.orbitFadeEdgeStart} aria-hidden="true" />
          <div className={styles.orbitFadeEdgeEnd} aria-hidden="true" />
          <div
            className={styles.categoryOrbitTrack}
            role="tablist"
            aria-label={`${activeDeptObj.label} category filter`}
          >
            {circles.map((circle, idx) => {
              const isActive = activeCategory === circle.slug;
              return (
                <button
                  key={circle.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.categoryOrbItem} ${isActive ? styles.categoryOrbItemLive : ""}`}
                  style={{ "--delay": `${idx * 0.06}s` }}
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
                  <span className={styles.categoryOrbCaption}>
                    {circle.name}
                  </span>
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

        {/* Products Grid — dynamically filtered & diverse showcase */}
        <div className={styles.curatedShowcaseGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))
          ) : (
            <div className={styles.showcaseEmptyNotice}>
              No pieces currently in this selection. Explore all{" "}
              {activeDeptObj.label} in our catalog.
            </div>
          )}
        </div>

        {/* Shop More — below grid, centered */}
        <div className={styles.rangeFooterCtaRow}>
          <Link href={shopMoreHref} className={styles.exploreMoreCta}>
            <span>Shop More</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
