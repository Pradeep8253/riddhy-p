"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import ProductGrid from "@/components/ui/ProductGrid";
import { formatINR } from "@/lib/demo-data";
import Icon from "@/components/ui/Icon";
import styles from "./ListingClient.module.css";

const DEFAULT_PAGE_SIZE = 12;

export default function ListingClient({
  products = [],
  title = "Explore the collection",
  description = "Thoughtfully selected for your home.",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = useSelector((state) => state.ui?.locale || "en");

  // Search & Filter State from URL
  const [query, setQuery] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [maxPrice, setMaxPrice] = useState(Number(params.get("maxPrice") || 0));
  const [brand, setBrand] = useState(params.get("brand") || "");
  const [inStockOnly, setInStockOnly] = useState(
    params.get("inStock") === "true",
  );
  const [minRating, setMinRating] = useState(Number(params.get("rating") || 0));
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination State
  const initialPage = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [gridCols, setGridCols] = useState(3);

  // Sync state when URL params change externally
  useEffect(() => {
    setQuery(params.get("q") || "");
    setSort(params.get("sort") || "featured");
    setMaxPrice(Number(params.get("maxPrice") || 0));
    setBrand(params.get("brand") || "");
    setInStockOnly(params.get("inStock") === "true");
    setMinRating(Number(params.get("rating") || 0));
    const p = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    setPage(p);
  }, [params]);

  // Unique Brands from current dataset
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products],
  );

  // Filtered and Sorted products list
  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.toLowerCase().trim();

    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.categoryLabel, p.tagline, p.sku]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    if (brand) {
      list = list.filter((p) => p.brand === brand);
    }

    if (maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    if (inStockOnly) {
      list = list.filter((p) => Number(p.stock ?? 1) > 0);
    }

    if (minRating > 0) {
      list = list.filter((p) => Number(p.rating || 0) >= minRating);
    }

    // Sorting logic
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "stock") {
      list.sort((a, b) => Number(b.stock ?? 0) - Number(a.stock ?? 0));
    }

    return list;
  }, [products, query, brand, maxPrice, inStockOnly, minRating, sort]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Ensure current page does not exceed totalPages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  // Synchronize URL with filter changes
  const syncUrl = (next = {}) => {
    const search = new URLSearchParams();
    const values = {
      q: query,
      sort,
      maxPrice: maxPrice || "",
      brand,
      inStock: inStockOnly ? "true" : "",
      rating: minRating || "",
      page: page > 1 ? String(page) : "",
      ...next,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "featured" && value !== "0") {
        search.set(key, String(value));
      }
    });

    router.replace(`${pathname}${search.size ? `?${search}` : ""}`, {
      scroll: false,
    });
  };

  // Debounced search input handler
  const setQueryAndSync = (value) => {
    setQuery(value);
    setPage(1);
    window.clearTimeout(window.__rfSearchTimer);
    window.__rfSearchTimer = window.setTimeout(() => {
      syncUrl({ q: value, page: "" });
    }, 250);
  };

  // Clear all filters
  const clear = () => {
    setQuery("");
    setSort("featured");
    setMaxPrice(0);
    setBrand("");
    setInStockOnly(false);
    setMinRating(0);
    setPage(1);
    router.replace(pathname, { scroll: false });
  };

  // Change page with smooth scroll
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    syncUrl({ page: newPage > 1 ? String(newPage) : "" });

    const resultsElement = document.getElementById("catalogue-results");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  // Current page items slice
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Generate page numbers array with ellipses
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  return (
    <div className={styles.layout}>
      {/* Sidebar Filters */}
      <aside className={`${styles.sidebar} ${filtersOpen ? styles.show : ""}`}>
        <div className={styles.filterTop}>
          <b>{locale === "hi" ? "फ़िल्टर और खोज" : "Refine your search"}</b>
          <button type="button" onClick={clear}>
            {locale === "hi" ? "सभी हटाएं" : "Clear all"}
          </button>
        </div>

        {/* Search Input */}
        <label className={styles.field}>
          <span>
            {locale === "hi" ? "कलेक्शन में खोजें" : "Search in collection"}
          </span>
          <div className={styles.inputWithIcon}>
            <Icon name="search" size={14} />
            <input
              value={query}
              onChange={(e) => setQueryAndSync(e.target.value)}
              placeholder={
                locale === "hi"
                  ? "उदा. सोफ़ा, टीक, इन्वर्टर"
                  : "e.g. Sofa, teak, inverter"
              }
            />
            {query && (
              <button
                type="button"
                className={styles.clearMini}
                onClick={() => setQueryAndSync("")}
              >
                ✕
              </button>
            )}
          </div>
        </label>

        {/* Stock Filter Checkbox */}
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                setInStockOnly(checked);
                setPage(1);
                syncUrl({ inStock: checked ? "true" : "", page: "" });
              }}
            />
            <span className={styles.checkboxText}>
              <b>
                {locale === "hi"
                  ? "केवल स्टॉक में उपलब्ध"
                  : "In-Stock Pieces Only"}
              </b>
              <small>
                {locale === "hi"
                  ? "बिक चुके आइटम छुपाएं"
                  : "Hide sold out and backordered items"}
              </small>
            </span>
          </label>
        </div>

        {/* Brand Filter */}
        <label className={styles.field}>
          <span>{locale === "hi" ? "ब्रांड" : "Brand"}</span>
          <select
            value={brand}
            onChange={(e) => {
              const value = e.target.value;
              setBrand(value);
              setPage(1);
              syncUrl({ brand: value, page: "" });
            }}
          >
            <option value="">
              {locale === "hi"
                ? `सभी ब्रांड (${brands.length})`
                : `All Brands (${brands.length})`}
            </option>
            {brands.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {/* Price Slider */}
        <label className={styles.field}>
          <span>
            {locale === "hi" ? "अधिकतम मूल्य:" : "Price up to:"}{" "}
            <strong>
              {maxPrice
                ? formatINR(maxPrice)
                : locale === "hi"
                  ? "कोई भी बजट"
                  : "Any budget"}
            </strong>
          </span>
          <input
            type="range"
            min="0"
            max="150000"
            step="5000"
            value={maxPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMaxPrice(value);
              setPage(1);
              syncUrl({ maxPrice: value, page: "" });
            }}
          />
          <span className={styles.rangeEnds}>
            <span>{locale === "hi" ? "कोई भी" : "Any"}</span>
            <span>₹1,50,000</span>
          </span>
        </label>

        {/* Rating Filter */}
        <label className={styles.field}>
          <span>{locale === "hi" ? "ग्राहक रेटिंग" : "Customer Rating"}</span>
          <select
            value={minRating}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMinRating(value);
              setPage(1);
              syncUrl({ rating: value, page: "" });
            }}
          >
            <option value="0">
              {locale === "hi" ? "सभी रेटिंग" : "All Customer Ratings"}
            </option>
            <option value="4.5">
              {locale === "hi"
                ? "★ 4.5 एवं ऊपर (उत्कृष्ट)"
                : "★ 4.5 & Above (Exceptional)"}
            </option>
            <option value="4.0">
              {locale === "hi"
                ? "★ 4.0 एवं ऊपर (शीर्ष रेटेड)"
                : "★ 4.0 & Above (Top Rated)"}
            </option>
            <option value="3.5">
              {locale === "hi" ? "★ 3.5 एवं ऊपर" : "★ 3.5 & Above"}
            </option>
          </select>
        </label>

        {/* Value Badges */}
        <div className={styles.checks}>
          <b>
            {locale === "hi"
              ? "पारदर्शिता एवं गारंटी"
              : "Crafted For Transparency"}
          </b>
          <span>
            <Icon name="check" size={13} />{" "}
            {locale === "hi"
              ? "रियल-टाइम लाइव इन्वेंटरी"
              : "Real-time live inventory"}
          </span>
          <span>
            <Icon name="check" size={13} />{" "}
            {locale === "hi"
              ? "5-वर्षीय सॉलिड वुड वारंटी"
              : "5-year solid wood warranty"}
          </span>
          <span>
            <Icon name="check" size={13} />{" "}
            {locale === "hi"
              ? "मुफ़्त इंस्टॉलेशन एवं सेटअप"
              : "Free white-glove setup"}
          </span>
        </div>
      </aside>

      {/* Results Main Column */}
      <div className={styles.results} id="catalogue-results">
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.mobileFilter}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon name="compare" size={14} />
            {filtersOpen
              ? locale === "hi"
                ? "फ़िल्टर बंद करें"
                : "Close filters"
              : locale === "hi"
                ? "फ़िल्टर और सॉर्ट"
                : "Filters & sort"}
          </button>

          <span className={styles.resultCount}>
            {locale === "hi" ? (
              <>
                <b>{filtered.length}</b> में से{" "}
                <b>
                  {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filtered.length)}
                </b>{" "}
                उत्पाद
              </>
            ) : (
              <>
                Showing{" "}
                <b>
                  {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filtered.length)}
                </b>{" "}
                of <b>{filtered.length}</b> handcrafted finds
              </>
            )}
          </span>

          <div className={styles.sortControls}>
            <label>
              {locale === "hi" ? "क्रमबद्ध करें:" : "Sort by:"}
              <select
                value={sort}
                onChange={(e) => {
                  const value = e.target.value;
                  setSort(value);
                  setPage(1);
                  syncUrl({ sort: value, page: "" });
                }}
              >
                <option value="featured">
                  {locale === "hi" ? "विशेष कलेक्शन" : "Featured Collection"}
                </option>
                <option value="price-asc">
                  {locale === "hi"
                    ? "मूल्य: कम से ज़्यादा"
                    : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {locale === "hi"
                    ? "मूल्य: ज़्यादा से कम"
                    : "Price: High to Low"}
                </option>
                <option value="rating">
                  {locale === "hi" ? "सर्वोच्च रेटेड" : "Highest Rated"}
                </option>
                <option value="stock">
                  {locale === "hi"
                    ? "उपलब्ध स्टॉक पहले"
                    : "Stock Available First"}
                </option>
              </select>
            </label>

            <label className={styles.pageSizeSelect}>
              {locale === "hi" ? "प्रति पृष्ठ:" : "Per page:"}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
              </select>
            </label>

            {/* Grid Layout Switcher */}
            <div className={styles.gridSwitcher} role="group" aria-label="Grid layout switcher">
              <button
                type="button"
                className={`${styles.gridSwitchBtn} ${gridCols === 2 ? styles.activeGrid : ''}`}
                onClick={() => setGridCols(2)}
                title={locale === "hi" ? "2 कॉलम दृश्य (बड़ा)" : "2 Columns (Large)"}
                aria-label="2 columns"
              >
                2 Col
              </button>
              <button
                type="button"
                className={`${styles.gridSwitchBtn} ${gridCols === 3 ? styles.activeGrid : ''}`}
                onClick={() => setGridCols(3)}
                title={locale === "hi" ? "3 कॉलम दृश्य (मानक)" : "3 Columns (Standard)"}
                aria-label="3 columns"
              >
                3 Col
              </button>
              <button
                type="button"
                className={`${styles.gridSwitchBtn} ${gridCols === 4 ? styles.activeGrid : ''}`}
                onClick={() => setGridCols(4)}
                title={locale === "hi" ? "4 कॉलम दृश्य (संक्षिप्त)" : "4 Columns (Compact)"}
                aria-label="4 columns"
              >
                4 Col
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        {(query || brand || maxPrice > 0 || inStockOnly || minRating > 0) && (
          <div className={styles.chips}>
            {query && (
              <button onClick={() => setQueryAndSync("")} type="button">
                “{query}” <Icon name="close" size={12} />
              </button>
            )}
            {inStockOnly && (
              <button
                onClick={() => {
                  setInStockOnly(false);
                  syncUrl({ inStock: "" });
                }}
                type="button"
              >
                {locale === "hi" ? "केवल स्टॉक में" : "In Stock Only"}{" "}
                <Icon name="close" size={12} />
              </button>
            )}
            {brand && (
              <button
                onClick={() => {
                  setBrand("");
                  syncUrl({ brand: "" });
                }}
                type="button"
              >
                {locale === "hi" ? `ब्रांड: ${brand}` : `Brand: ${brand}`}{" "}
                <Icon name="close" size={12} />
              </button>
            )}
            {maxPrice > 0 && (
              <button
                onClick={() => {
                  setMaxPrice(0);
                  syncUrl({ maxPrice: "" });
                }}
                type="button"
              >
                {locale === "hi"
                  ? `${formatINR(maxPrice)} तक`
                  : `Up to ${formatINR(maxPrice)}`}{" "}
                <Icon name="close" size={12} />
              </button>
            )}
            {minRating > 0 && (
              <button
                onClick={() => {
                  setMinRating(0);
                  syncUrl({ rating: "" });
                }}
                type="button"
              >
                ★ {minRating}+ <Icon name="close" size={12} />
              </button>
            )}
            <button
              onClick={clear}
              className={styles.clearAllChip}
              type="button"
            >
              {locale === "hi" ? "सभी हटाएं" : "Clear All"}
            </button>
          </div>
        )}

        {/* Products Grid & Pagination */}
        {filtered.length > 0 ? (
          <>
            <ProductGrid products={paginatedProducts} cols={gridCols} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                className={styles.pagination}
                aria-label="Products pagination"
              >
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  aria-label={locale === "hi" ? "पिछला पृष्ठ" : "Previous page"}
                >
                  <Icon name="arrowLeft" size={14} />{" "}
                  {locale === "hi" ? "पिछला" : "Previous"}
                </button>

                <div className={styles.pageNumbers}>
                  {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className={styles.ellipsis}>
                        …
                      </span>
                    ) : (
                      <button
                        key={`p-${p}`}
                        type="button"
                        className={`${styles.pageNumber} ${p === page ? styles.activePage : ""}`}
                        onClick={() => handlePageChange(p)}
                        aria-current={p === page ? "page" : undefined}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  aria-label={locale === "hi" ? "अगला पृष्ठ" : "Next page"}
                >
                  {locale === "hi" ? "अगला" : "Next"}{" "}
                  <Icon name="arrow" size={14} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <h3>
              {locale === "hi"
                ? "कोई उत्पाद नहीं मिला।"
                : "No exact matches just yet."}
            </h3>
            <p>
              {locale === "hi"
                ? "फ़िल्टर बदलकर या अलग शब्द खोजकर देखें।"
                : "Try a broader search, adjust your budget, or clear one of the filters."}
            </p>
            <button onClick={clear} type="button" className={styles.resetBtn}>
              {locale === "hi" ? "फ़िल्टर रीसेट करें" : "Reset all filters"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
