'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  Pin,
  EyeOff,
  RefreshCw,
  Tag,
  Check,
  Star,
  Flame,
  Award,
  Clock,
  Search,
  Plus,
  SlidersHorizontal,
  X,
  Edit2
} from 'lucide-react';
import { formatPriceSafe } from '@/lib/pricing';
import styles from './AdminMerchandising.module.css';

const AdminProductDrawer = dynamic(() => import('./AdminProductDrawer'), {
  ssr: false,
  loading: () => null
});

const RAILS = [
  { id: 'best-selling', label: 'Best Selling', icon: Award, desc: 'Ranked by real units sold in last 30 days.' },
  { id: 'popular', label: 'Popular', icon: Star, desc: 'Weighted score of views, wishlists and purchases.' },
  { id: 'trending', label: 'Trending', icon: Flame, desc: 'Highest sales and browsing velocity.' },
  { id: 'new-arrival', label: 'New Arrivals', icon: Clock, desc: 'Products created within last 30 days.' },
  { id: 'deal', label: 'Deals & Offers', icon: Tag, desc: 'Promotional discount items.' },
  { id: 'featured', label: 'Featured', icon: Sparkles, desc: 'Handpicked brand hero pieces.' }
];

export default function AdminMerchandising() {
  const [activeTab, setActiveTab] = useState('best-selling');
  const [railsData, setRailsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [toast, setToast] = useState('');

  // Search & Filter state for current collection view
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pinFilter, setPinFilter] = useState('all');
  const [sortOption, setSortOption] = useState('sales:desc');
  const [density, setDensity] = useState('normal');
  const [selectedIds, setSelectedIds] = useState([]);

  // Product Drawer state
  const [editingProduct, setEditingProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add Products Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchMerchandising = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/merchandising');
      const data = await res.json();
      if (res.ok && data.success) {
        setRailsData(data.data.rails || {});
      } else {
        showToast(data.error?.message || 'Failed to load merchandising rails.');
      }
    } catch (err) {
      showToast(err.message || 'Error connecting to merchandising service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchandising();
  }, []);

  const handleRecompute = async () => {
    try {
      setRecomputing(true);
      const res = await fetch('/api/admin/products/recompute-tags', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.data.message || 'Tags successfully recomputed!');
        fetchMerchandising();
      } else {
        showToast(data.error?.message || 'Recomputation failed.');
      }
    } catch (err) {
      showToast(err.message || 'Error during tag recomputation.');
    } finally {
      setRecomputing(false);
    }
  };

  const handleTogglePin = async (productId, currentPinned) => {
    try {
      const action = currentPinned ? 'unpin' : 'pin';
      const res = await fetch('/api/admin/merchandising', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action, tag: activeTab })
      });
      if (res.ok) {
        showToast(currentPinned ? 'Product unpinned from collection.' : 'Product pinned to collection!');
        fetchMerchandising();
      }
    } catch (err) {
      showToast('Failed to update pin override.');
    }
  };

  const handleToggleHide = async (productId) => {
    try {
      const res = await fetch('/api/admin/merchandising', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'hide', tag: activeTab })
      });
      if (res.ok) {
        showToast('Product excluded from collection.');
        fetchMerchandising();
      }
    } catch (err) {
      showToast('Failed to exclude product.');
    }
  };

  // Bulk Actions
  const handleBulkPin = async () => {
    try {
      for (const id of selectedIds) {
        await fetch('/api/admin/merchandising', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, action: 'pin', tag: activeTab })
        });
      }
      showToast(`${selectedIds.length} products pinned to collection.`);
      setSelectedIds([]);
      fetchMerchandising();
    } catch {
      showToast('Error during bulk pin.');
    }
  };

  const handleBulkExclude = async () => {
    try {
      for (const id of selectedIds) {
        await fetch('/api/admin/merchandising', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, action: 'hide', tag: activeTab })
        });
      }
      showToast(`${selectedIds.length} products excluded from collection.`);
      setSelectedIds([]);
      fetchMerchandising();
    } catch {
      showToast('Error during bulk exclude.');
    }
  };

  // Add Product to collection modal search
  useEffect(() => {
    if (!addModalOpen) return;
    const term = addSearchTerm.trim();
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/products?limit=15&q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data?.items)) {
            setSearchResults(data.data.items);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [addSearchTerm, addModalOpen]);

  const handleAddProductToCollection = async (product) => {
    try {
      const res = await fetch('/api/admin/merchandising', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id, action: 'pin', tag: activeTab })
      });
      if (res.ok) {
        showToast(`"${product.name}" added and pinned to ${currentRailConfig.label}!`);
        fetchMerchandising();
      } else {
        showToast('Failed to add product.');
      }
    } catch {
      showToast('Error adding product to collection.');
    }
  };

  const currentRailConfig = RAILS.find((r) => r.id === activeTab) || RAILS[0];
  const rawProducts = railsData[activeTab] || [];

  // Extract unique categories from current items
  const availableCategories = useMemo(() => {
    return [...new Set(rawProducts.map((p) => p.categoryLabel || p.category).filter(Boolean))].sort();
  }, [rawProducts]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((p) => (p.type || '').toLowerCase() === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => (p.categoryLabel || p.category) === categoryFilter);
    }

    // Pin filter
    if (pinFilter === 'pinned') {
      result = result.filter((p) => p.isPinned);
    } else if (pinFilter === 'auto') {
      result = result.filter((p) => !p.isPinned);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === 'sales:desc') return (b.sales30d || 0) - (a.sales30d || 0);
      if (sortOption === 'price:asc') return (a.price || 0) - (b.price || 0);
      if (sortOption === 'price:desc') return (b.price || 0) - (a.price || 0);
      if (sortOption === 'stock:desc') return (b.stock || 0) - (a.stock || 0);
      if (sortOption === 'name:asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [rawProducts, searchQuery, typeFilter, categoryFilter, pinFilter, sortOption]);

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Header */}
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#1f5f2e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Catalogue · Storefront Merchandising
          </div>
          <h1>Collections &amp; Merchandising Rails</h1>
          <p>Control product ordering, tags, and pin overrides for storefront carousels and tag collections.</p>
        </div>
      </div>

      {/* Collection Tabs */}
      <div className={styles.statusTabs}>
        {RAILS.map((rail) => {
          const IconComponent = rail.icon;
          const count = (railsData[rail.id] || []).length;
          return (
            <button
              key={rail.id}
              type="button"
              className={`${styles.statusTab} ${activeTab === rail.id ? styles.activeStatus : ''}`}
              onClick={() => {
                setActiveTab(rail.id);
                setSelectedIds([]);
              }}
            >
              <IconComponent size={14} />
              <span>{rail.label}</span>
              <span className={styles.tabBadge}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Collection Rule Info Banner */}
      <div className={styles.collectionBanner}>
        <div className={styles.collectionBannerLeft}>
          <div className={styles.collectionIcon}>
            <currentRailConfig.icon size={20} />
          </div>
          <div>
            <div className={styles.collectionTitle}>{currentRailConfig.label} Rail ({rawProducts.length} items)</div>
            <div className={styles.collectionDesc}>{currentRailConfig.desc} Pinned items stay locked at the top of the collection on live storefront.</div>
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search name, SKU, brand, category..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="furniture">Furniture</option>
            <option value="appliance">Appliance</option>
            <option value="utensils">Utensils</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={pinFilter}
            onChange={(e) => setPinFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="pinned">Pinned Only</option>
            <option value="auto">Automatic Only</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <select
            className={styles.filterSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="sales:desc">Sales (High to Low)</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="stock:desc">Stock: High to Low</option>
            <option value="name:asc">Name (A to Z)</option>
          </select>

          <button
            type="button"
            className={styles.densityBtn}
            onClick={() => setDensity(density === 'normal' ? 'dense' : 'normal')}
            title="Toggle table row density"
          >
            <SlidersHorizontal size={13} />
            <span>{density === 'normal' ? 'Normal' : 'Dense'}</span>
          </button>
        </div>
      </div>

      {/* Product Table Container */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${density === 'dense' ? styles.dense : ''}`}>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all products"
                  />
                </th>
                <th>Product &amp; SKU</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price (₹)</th>
                <th>MRP (₹)</th>
                <th>Stock</th>
                <th>30d Sales</th>
                <th>Collection Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '48px' }}>
                    Loading collection products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateTitle}>No products found in this rail</div>
                      <p>No products currently assigned to this collection rail.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const img = p.image || p.gallery?.[0]?.thumbUrl || p.gallery?.[0]?.url || '/placeholder.png';
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} className={isSelected ? styles.selectedRow : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </td>

                      {/* Product & SKU */}
                      <td>
                        <div className={styles.productCell}>
                          <div className={styles.productThumb}>
                            <Image src={img} alt={p.name} fill sizes="44px" unoptimized />
                          </div>
                          <div className={styles.productMeta}>
                            <span
                              className={styles.productName}
                              onClick={() => {
                                setEditingProduct(p);
                                setDrawerOpen(true);
                              }}
                            >
                              {p.name}
                            </span>
                            <span className={styles.productSku}>{p.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span>{p.categoryLabel || p.category || '—'}</span>
                      </td>

                      {/* Type */}
                      <td>
                        <span className={styles.typeBadge}>
                          {p.type || (p.category?.includes('sofa') ? 'furniture' : 'appliance')}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <strong style={{ fontWeight: '700', color: '#0f172a' }}>
                          {formatPriceSafe(p.price)}
                        </strong>
                      </td>

                      {/* MRP */}
                      <td>
                        <span style={{ color: '#94a3b8', textDecoration: p.mrp > p.price ? 'line-through' : 'none' }}>
                          {p.mrp ? formatPriceSafe(p.mrp) : '—'}
                        </span>
                      </td>

                      {/* Stock */}
                      <td>
                        <span
                          style={{
                            fontWeight: '600',
                            color: (p.stock || 0) <= 5 ? '#d97706' : '#166534'
                          }}
                        >
                          {p.stock !== undefined ? `${p.stock} units` : 'In stock'}
                        </span>
                      </td>

                      {/* 30d Sales */}
                      <td>
                        <span style={{ fontWeight: '600' }}>{p.sales30d || 0}</span>
                      </td>

                      {/* Collection Override Status */}
                      <td>
                        {p.isPinned ? (
                          <span className={styles.pinBadgePinned} title="Pinned: stays permanently in this rail">
                            <Pin size={11} />
                            <span>Pinned</span>
                          </span>
                        ) : (
                          <span className={styles.pinBadgeAuto} title="Auto computed based on real storefront metrics">
                            <Check size={11} />
                            <span>Auto</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={`${styles.btnAction} ${p.isPinned ? styles.btnActionPinned : ''}`}
                            onClick={() => handleTogglePin(p.id, p.isPinned)}
                            title={p.isPinned ? 'Unpin product' : 'Pin to top of collection'}
                          >
                            <Pin size={12} />
                            <span>{p.isPinned ? 'Unpin' : 'Pin'}</span>
                          </button>

                          <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnActionExclude}`}
                            onClick={() => handleToggleHide(p.id)}
                            title="Exclude from this collection"
                          >
                            <EyeOff size={12} />
                            <span>Exclude</span>
                          </button>

                          <button
                            type="button"
                            className={styles.btnEdit}
                            onClick={() => {
                              setEditingProduct(p);
                              setDrawerOpen(true);
                            }}
                            title="Edit product"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedIds.length} Selected</span>
          <button type="button" className={styles.bulkBtn} onClick={handleBulkPin}>
            <Pin size={13} /> Pin All Selected
          </button>
          <button
            type="button"
            className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`}
            onClick={handleBulkExclude}
          >
            <EyeOff size={13} /> Exclude Selected
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => setSelectedIds([])}
          >
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* Add Products to Collection Modal */}
      {addModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAddModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>+ Add Products to {currentRailConfig.label}</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <input
                type="text"
                placeholder="Search catalogue by product name, SKU, or category..."
                className={styles.modalSearchInput}
                value={addSearchTerm}
                onChange={(e) => setAddSearchTerm(e.target.value)}
                autoFocus
              />

              <div className={styles.modalProductList}>
                {searchLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Searching catalogue...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    {addSearchTerm ? 'No matching products found.' : 'Type to search products to add.'}
                  </div>
                ) : (
                  searchResults.map((product) => {
                    const alreadyInRail = rawProducts.some((p) => (p.id || p._id) === (product._id || product.id));
                    const img = product.image || product.gallery?.[0]?.thumbUrl || product.gallery?.[0]?.url || '/placeholder.png';

                    return (
                      <div key={product._id || product.id} className={styles.modalProductRow}>
                        <div className={styles.modalProductInfo}>
                          <img src={img} alt={product.name} className={styles.modalProductThumb} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: '#0f172a' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              SKU: {product.sku} · {formatPriceSafe(product.price)}
                            </div>
                          </div>
                        </div>

                        {alreadyInRail ? (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> In Rail
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={styles.modalAddBtn}
                            onClick={() => handleAddProductToCollection(product)}
                          >
                            + Pin &amp; Add
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Product Edit Drawer */}
      <AdminProductDrawer
        isOpen={drawerOpen}
        initialData={editingProduct}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
        }}
        onSaved={() => {
          showToast('Product successfully saved.');
          fetchMerchandising();
        }}
      />
    </div>
  );
}
