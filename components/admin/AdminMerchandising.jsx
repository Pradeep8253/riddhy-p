'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Pin,
  EyeOff,
  RefreshCw,
  Tag,
  Check,
  TrendingUp,
  Star,
  Flame,
  Award,
  Clock
} from 'lucide-react';
import { formatPriceSafe } from '@/lib/pricing';
import styles from './AdminMerchandising.module.css';

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
        showToast(currentPinned ? 'Product unpinned.' : 'Product pinned to rail!');
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
        showToast('Product excluded from rail.');
        fetchMerchandising();
      }
    } catch (err) {
      showToast('Failed to exclude product.');
    }
  };

  const currentRailConfig = RAILS.find((r) => r.id === activeTab) || RAILS[0];
  const currentProducts = railsData[activeTab] || [];

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Merchandising &amp; Rails</h1>
          <p>Control product ordering, tags, and pin overrides for storefront carousels and tag collections.</p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleRecompute}
            disabled={recomputing}
          >
            <RefreshCw size={15} className={recomputing ? 'animate-spin' : ''} />
            <span>{recomputing ? 'Recomputing Tags...' : 'Recompute Tags Now'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {RAILS.map((rail) => {
          const IconComponent = rail.icon;
          const count = (railsData[rail.id] || []).length;
          return (
            <button
              key={rail.id}
              type="button"
              className={`${styles.tab} ${activeTab === rail.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(rail.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconComponent size={14} />
                <span>{rail.label}</span>
                <span className={styles.railCount}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Rail Detail Card */}
      <div className={styles.railCard}>
        <div className={styles.railHead}>
          <div>
            <div className={styles.railHeadTitle}>
              <currentRailConfig.icon size={18} color="#1b5e20" />
              <span>{currentRailConfig.label} Rail</span>
              <span className={styles.railCount}>{currentProducts.length} Products</span>
            </div>
            <div style={{ fontSize: '12px', color: '#65746b', marginTop: '2px' }}>
              {currentRailConfig.desc}
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading rail products...</div>
        ) : currentProducts.length === 0 ? (
          <div className={styles.emptyState}>
            No products currently in this rail. Run &quot;Recompute Tags Now&quot; or pin products from the catalogue.
          </div>
        ) : (
          <div className={styles.productList}>
            {currentProducts.map((p) => {
              const img = p.image || p.gallery?.[0]?.url || '/placeholder.png';
              return (
                <div key={p.id} className={styles.itemCard}>
                  <div className={styles.itemThumb}>
                    <Image src={img} alt={p.name} fill sizes="60px" />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName} title={p.name}>
                      {p.name}
                    </div>
                    <div className={styles.itemMeta}>
                      SKU: {p.sku || 'N/A'} · 30d Sales: <strong>{p.sales30d || 0}</strong>
                    </div>
                    <div className={styles.itemPrice}>
                      {formatPriceSafe(p.price)}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${p.isPinned ? styles.actionPinned : ''}`}
                        onClick={() => handleTogglePin(p.id, p.isPinned)}
                        title="Pin this product so automated recomputations never remove it"
                      >
                        <Pin size={12} />
                        <span>{p.isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleToggleHide(p.id)}
                        title="Hide/exclude product from this rail"
                      >
                        <EyeOff size={12} />
                        <span>Exclude</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
