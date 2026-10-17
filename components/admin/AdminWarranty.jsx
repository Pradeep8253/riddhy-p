'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  UserCheck
} from 'lucide-react';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import styles from './AdminWarranty.module.css';

export default function AdminWarranty() {
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'review_queue' | 'claims'
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/admin/warranty?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to load warranty records');
      }

      if (activeTab === 'claims') {
        setItems(data.data?.claims || []);
      } else {
        setItems(data.data?.registrations || []);
      }
      setTotal(data.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load warranty records');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, search, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const handleReviewAction = async (id, action) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/warranty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      if (!res.ok) throw new Error('Action failed');
      fetchRecords();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'active') return styles.statusActive;
    if (status === 'expiring_soon') return styles.statusExpiring;
    return styles.statusExpired;
  };

  const exportColumns = [
    { label: 'Customer Name', key: 'customerName' },
    { label: 'Customer Phone', key: 'customerPhone' },
    { label: 'Product Name', key: 'productName' },
    { label: 'SKU', key: 'sku' },
    { label: 'Serial Number', key: 'serialNumber' },
    { label: 'Order Ref', key: 'orderNumber' },
    { label: 'Purchase Date', key: 'purchaseDate', getValue: (r) => r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString('en-IN') : '—' },
    { label: 'Expiry Date', key: 'expiryDate', getValue: (r) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '—' },
    { label: 'Remaining Days', key: 'remainingDays' },
    { label: 'Warranty Status', key: 'currentStatus' }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1>Warranty Care &amp; Review Desk</h1>
          <p>Automated purchase registrations, offline proof verification queue, and service claim management.</p>
        </div>

        <div className={styles.controls}>
          <ExportDropdown
            title="Warranty Export"
            filename={`warranty-export-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={items}
            apiEndpoint="/api/admin/warranty/export"
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #d5cec2', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('registrations'); setPage(1); }}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            borderBottom: activeTab === 'registrations' ? '2px solid #1b5e20' : '2px solid transparent',
            color: activeTab === 'registrations' ? '#1b5e20' : '#647065'
          }}
        >
          All Registrations
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('review_queue'); setPage(1); }}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            borderBottom: activeTab === 'review_queue' ? '2px solid #1b5e20' : '2px solid transparent',
            color: activeTab === 'review_queue' ? '#1b5e20' : '#647065'
          }}
        >
          Offline Review Queue
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('claims'); setPage(1); }}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            borderBottom: activeTab === 'claims' ? '2px solid #1b5e20' : '2px solid transparent',
            color: activeTab === 'claims' ? '#1b5e20' : '#647065'
          }}
        >
          Claims Desk
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #d5cec2', borderRadius: '8px', padding: '0 10px', minHeight: '38px', flex: 1, maxWidth: '380px' }}>
          <Search size={14} color="#727e74" />
          <input
            type="text"
            placeholder="Search customer, phone, serial, order, SKU..."
            className={styles.searchInput}
            style={{ border: 'none', outline: 'none', marginLeft: '8px', width: '100%', fontSize: '13px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {activeTab !== 'review_queue' && (
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expiring_soon">Expiring Soon (≤30d)</option>
            <option value="expired">Expired</option>
          </select>
        )}
      </div>

      {error && (
        <div style={{ color: '#c62828', background: '#ffebee', padding: '12px 16px', borderRadius: '8px', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading warranty records...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === 'review_queue'
              ? 'Review queue is clear! All customer registrations have been verified.'
              : 'No warranty records found matching criteria.'}
          </div>
        ) : activeTab === 'claims' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Claim No</th>
                <th>Date</th>
                <th>Issue Description</th>
                <th>Preferred Contact</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.claimNumber || c.id.slice(-8)}</strong></td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{c.issue}</td>
                  <td>{c.preferredContact || 'Phone'}</td>
                  <td>{c.assignedToEmail || 'Unassigned'}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: '#eaf5ec', color: '#17632a' }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer &amp; Phone</th>
                <th>Product &amp; SKU</th>
                <th>Order Ref</th>
                <th>Purchase &amp; Expiry</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Verification</th>
                {activeTab === 'review_queue' && <th>Review Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b style={{ color: 'var(--rf-forest-deep)', display: 'block' }}>{r.customerName}</b>
                    <span style={{ color: '#7b857d' }}>{r.customerPhone}</span>
                  </td>
                  <td>
                    <b style={{ display: 'block' }}>{r.productName || r.sku}</b>
                    <span style={{ color: '#7b857d', fontSize: '11px' }}>
                      SKU: {r.sku} {r.serialNumber ? `· S/N: ${r.serialNumber}` : ''}
                    </span>
                  </td>
                  <td>{r.orderNumber || 'Offline'}</td>
                  <td>
                    <div>Bought: {r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString('en-IN') : '—'}</div>
                    <div style={{ color: '#7b857d' }}>Expires: {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '—'}</div>
                  </td>
                  <td>
                    <b style={{ color: r.remainingDays <= 30 ? '#c62828' : 'var(--rf-forest-deep)' }}>
                      {r.remainingDays} Days
                    </b>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getBadgeClass(r.currentStatus || r.status)}`}>
                      {r.currentStatus || r.status}
                    </span>
                  </td>
                  <td>
                    {r.verified ? (
                      <span style={{ color: '#17632a', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: '#c62828', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                  </td>
                  {activeTab === 'review_queue' && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, 'approve')}
                          disabled={updatingId === r.id}
                          style={{ background: '#1b5e20', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, 'reject')}
                          disabled={updatingId === r.id}
                          style={{ background: '#b71c1c', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > pageSize && (
        <AdminPagination
          currentPage={page}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="records"
        />
      )}
    </div>
  );
}
