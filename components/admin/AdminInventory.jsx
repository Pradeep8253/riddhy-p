'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Minus, Settings2, RefreshCw, X, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import { formatDateDDMMYYYY } from '@/lib/date-utils';
import styles from './AdminInventory.module.css';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for Stock In / Out / Adjust
  const [modalMode, setModalMode] = useState(null); // 'in' | 'out' | 'adjust'
  const [activeItem, setActiveItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalReason, setModalReason] = useState('');

  const load = () => {
    setBusy(true);
    fetch('/api/admin/inventory', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setItems(json.data || []);
        else setMessage(json.error?.message || 'Unable to load stock.');
      })
      .catch(() => setMessage('Unable to load stock.'))
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (item) =>
          item.product?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.warehouseCode?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'in_stock') {
      list = list.filter((item) => item.available > (item.lowStockAt || 5));
    } else if (statusFilter === 'low_stock') {
      list = list.filter((item) => item.available > 0 && item.available <= (item.lowStockAt || 5));
    } else if (statusFilter === 'out_of_stock') {
      list = list.filter((item) => item.available === 0);
    }

    return list;
  }, [items, search, statusFilter]);

  // Pagination Slice
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Export Columns Definition
  const exportColumns = useMemo(
    () => [
      { key: 'sku', label: 'SKU' },
      { key: 'product', label: 'Product Name' },
      { key: 'warehouseCode', label: 'Warehouse' },
      { key: 'available', label: 'Available Stock' },
      { key: 'reserved', label: 'Reserved' },
      { key: 'lowStockAt', label: 'Threshold' },
      {
        key: 'status',
        label: 'Status',
        getValue: (r) => (r.available === 0 ? 'Out of Stock' : r.available <= (r.lowStockAt || 5) ? 'Low Stock' : 'In Stock')
      },
      {
        key: 'updatedAt',
        label: 'Last Updated',
        getValue: (r) => formatDateDDMMYYYY(r.updatedAt)
      }
    ],
    []
  );

  const openActionModal = (item, mode) => {
    setActiveItem(item);
    setModalMode(mode);
    setModalQty(mode === 'adjust' ? item.available : 5);
    setModalReason(
      mode === 'in'
        ? 'Restock shipment inward'
        : mode === 'out'
        ? 'Damaged stock / store display'
        : 'Cycle count verification'
    );
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem) return;

    setBusy(true);
    setMessage('');

    try {
      let payload = {
        sku: activeItem.sku,
        warehouseCode: activeItem.warehouseCode || 'DELHI-01',
        reason: modalReason.trim() || 'Inventory update'
      };

      if (modalMode === 'in') {
        payload.action = 'in';
        payload.quantity = Number(modalQty);
      } else if (modalMode === 'out') {
        payload.action = 'out';
        payload.quantity = Number(modalQty);
      } else {
        payload.action = 'set';
        payload.available = Number(modalQty);
      }

      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || 'Stock adjustment failed.');
      }

      const updated = json.data;
      setMessage(
        `✓ ${activeItem.sku} stock updated successfully to ${updated.available} units (${
          updated.delta > 0 ? '+' : ''
        }${updated.delta} units).`
      );

      // Local optimistic update
      setItems((prev) =>
        prev.map((it) =>
          it.sku === activeItem.sku ? { ...it, available: updated.available, lowStock: updated.available <= it.lowStockAt } : it
        )
      );

      setModalMode(null);
      setActiveItem(null);
    } catch (error) {
      setMessage(`✕ Error: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className="kicker">Warehouse & Inventory</span>
          <h1>Inventory.</h1>
          <p>Real-time warehouse stock levels, stock inward/outward adjustments, and live storefront sync.</p>
        </div>

        <div className={styles.topActions}>
          <ExportDropdown
            filename={`rf-inventory-${new Date().toISOString().slice(0, 10)}`}
            title="Warehouse Inventory Report"
            columns={exportColumns}
            data={filteredItems}
            label="Export Inventory"
          />

          <button type="button" onClick={load} disabled={busy} className={styles.refreshBtn}>
            <RefreshCw size={13} className={busy ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={styles.notice} role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} className={styles.closeBtn}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <Search size={15} color="#6a766c" />
          <input
            type="text"
            placeholder="Search by product name, SKU or warehouse..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className={styles.closeBtn}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (1–5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Threshold</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => {
                const isOutOfStock = item.available === 0;
                const isLow = !isOutOfStock && item.available <= (item.lowStockAt || 5);

                return (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.skuMeta}>
                        <b>{item.product}</b>
                        <small>{item.sku}</small>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.warehouseCode}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.stockBadge} ${
                          isOutOfStock ? styles.outOfStock : isLow ? styles.lowStock : styles.inStock
                        }`}
                      >
                        {item.available} units
                      </span>
                    </td>
                    <td>
                      <span style={{ color: item.reserved > 0 ? '#b27a1b' : '#647065', fontWeight: 600 }}>
                        {item.reserved}
                      </span>
                    </td>
                    <td>{item.lowStockAt || 5}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.stockInBtn}
                          disabled={busy}
                          onClick={() => openActionModal(item, 'in')}
                          title="Add incoming stock"
                        >
                          <Plus size={12} /> Stock In
                        </button>
                        <button
                          type="button"
                          className={styles.stockOutBtn}
                          disabled={busy || item.available === 0}
                          onClick={() => openActionModal(item, 'out')}
                          title="Deduct damaged or withdrawn stock"
                        >
                          <Minus size={12} /> Stock Out
                        </button>
                        <button
                          type="button"
                          className={styles.adjustBtn}
                          disabled={busy}
                          onClick={() => openActionModal(item, 'adjust')}
                          title="Set direct stock number"
                        >
                          <Settings2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!paginatedItems.length && (
          <div className={styles.empty}>
            <Package size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
            No inventory records found matching your filters.
          </div>
        )}

        {/* Reusable Admin Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Stock In / Out / Adjust Modal */}
      {modalMode && activeItem && (
        <div className={styles.modalBackdrop} onClick={() => setModalMode(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h3>
                  {modalMode === 'in' ? 'Stock In (Add Inventory)' : modalMode === 'out' ? 'Stock Out (Deduct Stock)' : 'Direct Stock Adjustment'}
                </h3>
                <p>
                  <b>{activeItem.product}</b> · {activeItem.sku}
                </p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setModalMode(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className={styles.modalForm}>
              <div style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#f5f1ea', borderRadius: 10, fontSize: 12 }}>
                <div>
                  Current Available: <b>{activeItem.available}</b>
                </div>
                <div>·</div>
                <div>
                  Reserved: <b>{activeItem.reserved}</b>
                </div>
              </div>

              <label>
                <span>{modalMode === 'adjust' ? 'New Available Stock' : 'Quantity to ' + (modalMode === 'in' ? 'Add' : 'Deduct')}</span>
                <input
                  type="number"
                  min={modalMode === 'adjust' ? '0' : '1'}
                  max={modalMode === 'out' ? activeItem.available : '10000'}
                  required
                  value={modalQty}
                  onChange={(e) => setModalQty(e.target.value)}
                  autoFocus
                />
              </label>

              <label>
                <span>Reason / Reference Note</span>
                <input
                  type="text"
                  required
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="e.g. Purchase order PO-2026, damage scrap, audit"
                />
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalMode(null)} disabled={busy}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.submitBtn} ${modalMode === 'out' ? styles.submitBtnOut : ''}`}
                  disabled={busy}
                >
                  {busy
                    ? 'Updating…'
                    : modalMode === 'in'
                    ? `Confirm +${modalQty} Stock In`
                    : modalMode === 'out'
                    ? `Confirm -${modalQty} Stock Out`
                    : `Set to ${modalQty} Units`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
