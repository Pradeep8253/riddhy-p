'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ui/ProductGrid';
import { formatINR } from '@/lib/demo-data';
import Icon from '@/components/ui/Icon';
import styles from './ListingClient.module.css';

const DEFAULT_PAGE_SIZE = 12;

const budgetPresets = [
  { label: 'All Budgets', min: 0, max: 0 },
  { label: 'Under ₹15,000', min: 0, max: 15000 },
  { label: '₹15,000 – ₹35,000', min: 15000, max: 35000 },
  { label: '₹35,000 – ₹60,000', min: 35000, max: 60000 },
  { label: 'Above ₹60,000', min: 60000, max: 200000 },
];

export default function ListingClient({
  products = [],
  title = 'Explore the Collection',
  description = 'Handcrafted furniture and smart home appliances designed for real life.',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Search & Filter State
  const [query, setQuery] = useState(params.get('q') || '');
  const [sort, setSort] = useState(params.get('sort') || 'featured');
  const [maxPrice, setMaxPrice] = useState(Number(params.get('maxPrice') || 0));
  const [minPrice, setMinPrice] = useState(Number(params.get('minPrice') || 0));
  const [brand, setBrand] = useState(params.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState(params.get('cat') || '');
  const [inStockOnly, setInStockOnly] = useState(params.get('inStock') === 'true');
  const [minRating, setMinRating] = useState(Number(params.get('rating') || 0));
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination State
  const initialPage = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [gridCols, setGridCols] = useState(3);

  // Sync state when URL params change
  useEffect(() => {
    setQuery(params.get('q') || '');
    setSort(params.get('sort') || 'featured');
    setMaxPrice(Number(params.get('maxPrice') || 0));
    setMinPrice(Number(params.get('minPrice') || 0));
    setBrand(params.get('brand') || '');
    setSelectedCategory(params.get('cat') || '');
    setInStockOnly(params.get('inStock') === 'true');
    setMinRating(Number(params.get('rating') || 0));
    const p = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
    setPage(p);
  }, [params]);

  // Categories extracted from products
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const cat = p.categoryLabel || p.category;
      if (cat) map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Unique Brands
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products]
  );

  // Filtered and Sorted list
  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.toLowerCase().trim();

    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.categoryLabel, p.category, p.tagline, p.sku]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((p) => (p.categoryLabel || p.category) === selectedCategory);
    }

    if (brand) {
      list = list.filter((p) => p.brand === brand);
    }

    if (minPrice > 0) {
      list = list.filter((p) => p.price >= minPrice);
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

    // Sorting
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === 'stock') {
      list.sort((a, b) => Number(b.stock ?? 0) - Number(a.stock ?? 0));
    }

    return list;
  }, [products, query, selectedCategory, brand, minPrice, maxPrice, inStockOnly, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const syncUrl = (next = {}) => {
    const search = new URLSearchParams();
    const values = {
      q: query,
      cat: selectedCategory,
      sort,
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      brand,
      inStock: inStockOnly ? 'true' : '',
      rating: minRating || '',
      page: page > 1 ? String(page) : '',
      ...next,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== 'featured' && value !== '0') {
        search.set(key, String(value));
      }
    });

    router.replace(`${pathname}${search.size ? `?${search}` : ''}`, {
      scroll: false,
    });
  };

  const setQueryAndSync = (value) => {
    setQuery(value);
    setPage(1);
    window.clearTimeout(window.__rfSearchTimer);
    window.__rfSearchTimer = window.setTimeout(() => {
      syncUrl({ q: value, page: '' });
    }, 250);
  };

  const handleBudgetSelect = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
    syncUrl({ minPrice: min || '', maxPrice: max || '', page: '' });
  };

  const handleCategorySelect = (catName) => {
    const next = selectedCategory === catName ? '' : catName;
    setSelectedCategory(next);
    setPage(1);
    syncUrl({ cat: next, page: '' });
  };

  const clear = () => {
    setQuery('');
    setSort('featured');
    setSelectedCategory('');
    setMinPrice(0);
    setMaxPrice(0);
    setBrand('');
    setInStockOnly(false);
    setMinRating(0);
    setPage(1);
    setFiltersOpen(false);
    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    syncUrl({ page: newPage > 1 ? String(newPage) : '' });

    const el = document.getElementById('catalogue-results');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  return (
    <div className={styles.layout}>
      {/* Category Pills Bar (Horizontal Quick Switcher) */}
      {categories.length > 1 && (
        <div className={styles.quickCatBar} role="tablist" aria-label="Product categories">
          <button
            type="button"
            className={`${styles.catPill} ${!selectedCategory ? styles.catPillActive : ''}`}
            onClick={() => handleCategorySelect('')}
          >
            All Designs ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`${styles.catPill} ${selectedCategory === c.name ? styles.catPillActive : ''}`}
              onClick={() => handleCategorySelect(c.name)}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      )}

      {/* Main Grid: Sidebar + Results */}
      <div className={styles.mainGrid}>
        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.showMobile : ''}`}>
          <div className={styles.filterTop}>
            <b>Refine Selection</b>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="button" className={styles.clearBtn} onClick={clear}>
                Reset all
              </button>
              <button
                type="button"
                className={styles.closeDrawerBtn}
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search within collection */}
          <div className={styles.field}>
            <span className={styles.fieldTitle}>Search Collection</span>
            <div className={styles.inputWithIcon}>
              <Icon name="search" size={15} />
              <input
                value={query}
                onChange={(e) => setQueryAndSync(e.target.value)}
                placeholder="Search by name, wood, model..."
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearMini}
                  onClick={() => setQueryAndSync('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Budget Chips */}
          <div className={styles.field}>
            <span className={styles.fieldTitle}>Price Range</span>
            <div className={styles.budgetChipsGrid}>
              {budgetPresets.map((b, idx) => {
                const isActive = (b.min === minPrice && b.max === maxPrice);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.budgetChip} ${isActive ? styles.budgetChipActive : ''}`}
                    onClick={() => handleBudgetSelect(b.min, b.max)}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInStockOnly(checked);
                  setPage(1);
                  syncUrl({ inStock: checked ? 'true' : '', page: '' });
                }}
              />
              <span className={styles.checkboxText}>
                <b>In-Stock Pieces Only</b>
                <small>Ready for prompt dispatch from Prayagraj warehouse</small>
              </span>
            </label>
          </div>

          {/* Brand Filter */}
          {brands.length > 1 && (
            <div className={styles.field}>
              <span className={styles.fieldTitle}>Brand / Maker</span>
              <select
                value={brand}
                onChange={(e) => {
                  const val = e.target.value;
                  setBrand(val);
                  setPage(1);
                  syncUrl({ brand: val, page: '' });
                }}
                className={styles.filterSelect}
              >
                <option value="">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Filter */}
          <div className={styles.field}>
            <span className={styles.fieldTitle}>Customer Rating</span>
            <select
              value={minRating}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinRating(val);
                setPage(1);
                syncUrl({ rating: val, page: '' });
              }}
              className={styles.filterSelect}
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & Above (Exceptional)</option>
              <option value="4.0">★ 4.0 & Above (Top Rated)</option>
              <option value="3.5">★ 3.5 & Above</option>
            </select>
          </div>

          {/* Value Assurances Box */}
          <div className={styles.checks}>
            <b>The Riddhy Guarantee</b>
            <span>
              <Icon name="check" size={13} color="#25d366" />
              10-Year Hardwood Frame Warranty
            </span>
            <span>
              <Icon name="check" size={13} color="#25d366" />
              Free White-Glove Installation
            </span>
            <span>
              <Icon name="check" size={13} color="#25d366" />
              10-Day Safe Transit Replacement
            </span>
            <span>
              <Icon name="check" size={13} color="#25d366" />
              Flexible No-Cost EMI Available
            </span>
          </div>

          {/* Mobile Apply Button */}
          <button
            type="button"
            className={styles.applyFilterBtnMobile}
            onClick={() => setFiltersOpen(false)}
          >
            Show {filtered.length} Results
          </button>
        </aside>

        {/* Results Main Column */}
        <div className={styles.results} id="catalogue-results">
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setFiltersOpen(true)}
            >
              <Icon name="sliders" size={15} />
              <span>Filters & Sort {((query || brand || minPrice > 0 || maxPrice > 0 || inStockOnly || minRating > 0 || selectedCategory) ? '• Active' : '')}</span>
            </button>

            <span className={styles.resultCount}>
              Showing <b>{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> handcrafted pieces
            </span>

            <div className={styles.sortControls}>
              <label className={styles.sortLabel}>
                <span>Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSort(val);
                    setPage(1);
                    syncUrl({ sort: val, page: '' });
                  }}
                  className={styles.sortSelect}
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Customer Rated</option>
                  <option value="newest">Latest Arrivals</option>
                  <option value="stock">In Stock First</option>
                </select>
              </label>

              <label className={styles.pageSizeSelect}>
                <span>Per page:</span>
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

              {/* Desktop Grid Switcher */}
              <div className={styles.gridSwitcher} role="group" aria-label="Grid layout switcher">
                <button
                  type="button"
                  className={`${styles.gridSwitchBtn} ${gridCols === 2 ? styles.activeGrid : ''}`}
                  onClick={() => setGridCols(2)}
                  title="2 Columns (Large)"
                  aria-label="2 columns"
                >
                  2 Col
                </button>
                <button
                  type="button"
                  className={`${styles.gridSwitchBtn} ${gridCols === 3 ? styles.activeGrid : ''}`}
                  onClick={() => setGridCols(3)}
                  title="3 Columns (Standard)"
                  aria-label="3 columns"
                >
                  3 Col
                </button>
                <button
                  type="button"
                  className={`${styles.gridSwitchBtn} ${gridCols === 4 ? styles.activeGrid : ''}`}
                  onClick={() => setGridCols(4)}
                  title="4 Columns (Compact)"
                  aria-label="4 columns"
                >
                  4 Col
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(query || brand || minPrice > 0 || maxPrice > 0 || inStockOnly || minRating > 0 || selectedCategory) && (
            <div className={styles.chips}>
              {selectedCategory && (
                <button onClick={() => handleCategorySelect('')} type="button">
                  Category: {selectedCategory} <Icon name="close" size={11} />
                </button>
              )}
              {query && (
                <button onClick={() => setQueryAndSync('')} type="button">
                  “{query}” <Icon name="close" size={11} />
                </button>
              )}
              {inStockOnly && (
                <button
                  onClick={() => {
                    setInStockOnly(false);
                    syncUrl({ inStock: '' });
                  }}
                  type="button"
                >
                  In Stock Only <Icon name="close" size={11} />
                </button>
              )}
              {brand && (
                <button
                  onClick={() => {
                    setBrand('');
                    syncUrl({ brand: '' });
                  }}
                  type="button"
                >
                  Brand: {brand} <Icon name="close" size={11} />
                </button>
              )}
              {(minPrice > 0 || maxPrice > 0) && (
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(0);
                    syncUrl({ minPrice: '', maxPrice: '' });
                  }}
                  type="button"
                >
                  {minPrice > 0 && maxPrice > 0
                    ? `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`
                    : maxPrice > 0
                    ? `Up to ₹${maxPrice.toLocaleString('en-IN')}`
                    : `From ₹${minPrice.toLocaleString('en-IN')}`}
                  <Icon name="close" size={11} />
                </button>
              )}
              {minRating > 0 && (
                <button
                  onClick={() => {
                    setMinRating(0);
                    syncUrl({ rating: '' });
                  }}
                  type="button"
                >
                  ★ {minRating}+ <Icon name="close" size={11} />
                </button>
              )}
              <button onClick={clear} className={styles.clearAllChip} type="button">
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filtered.length > 0 ? (
            <>
              <ProductGrid products={paginatedProducts} cols={gridCols} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Products pagination">
                  <button
                    type="button"
                    className={styles.pageArrow}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <Icon name="chevronLeft" size={14} /> Previous
                  </button>

                  <div className={styles.pageNumbers}>
                    {pageNumbers.map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className={styles.ellipsis}>
                          …
                        </span>
                      ) : (
                        <button
                          key={`p-${p}`}
                          type="button"
                          className={`${styles.pageNumber} ${p === page ? styles.activePage : ''}`}
                          onClick={() => handlePageChange(p)}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.pageArrow}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    Next <Icon name="chevronRight" size={14} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No matching pieces found</h3>
              <p>
                We could not find products matching your filters. Try clearing some criteria or adjusting your budget.
              </p>
              <button type="button" className={styles.resetBtn} onClick={clear}>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
