'use client';

import { useState, useEffect } from 'react';
import styles from './AdminWarranty.module.css';

export default function AdminWarranty() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  async function fetchRegistrations() {
    setLoading(true);
    setError('');
    try {
      let url = `/api/admin/warranty?status=${encodeURIComponent(statusFilter)}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/admin/login';
          return;
        }
        const errorMsg =
          data?.error?.message ||
          (typeof data?.error === 'string' ? data.error : '') ||
          'Failed to load warranty records';
        throw new Error(errorMsg);
      }
      setRegistrations(data?.data?.registrations || data?.registrations || []);
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : 'Failed to load warranty records');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchRegistrations();
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/warranty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg =
          data?.error?.message ||
          (typeof data?.error === 'string' ? data.error : '') ||
          'Failed to update status';
        throw new Error(errorMsg);
      }

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus, currentStatus: newStatus } : r))
      );
    } catch (err) {
      alert(typeof err?.message === 'string' ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  const getBadgeClass = (status) => {
    if (status === 'active') return styles.statusActive;
    if (status === 'expiring_soon') return styles.statusExpiring;
    return styles.statusExpired;
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1>Warranty & Registrations</h1>
          <p>Verify customer warranty registrations, validate purchase proof, and track remaining coverage.</p>
        </div>

        <div className={styles.controls}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search serial, phone, order, name..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className={styles.actionBtn}>
              Search
            </button>
          </form>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: '#c62828', background: '#ffebee', padding: '12px 16px', borderRadius: '8px', marginBottom: 16 }}>
          {typeof error === 'string' ? error : (error?.message || 'Failed to load warranty records')}
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading warranty registrations...</div>
        ) : registrations.length === 0 ? (
          <div className={styles.emptyState}>
            No registrations found{statusFilter !== 'all' ? ` matching status "${statusFilter}"` : ''}.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer & Phone</th>
                <th>Product & Serial</th>
                <th>Order Ref</th>
                <th>Purchase & Expiry</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Proof</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b style={{ color: 'var(--rf-forest-deep)', display: 'block' }}>{r.customerName}</b>
                    <span style={{ color: '#7b857d' }}>{r.customerPhone}</span>
                  </td>
                  <td>
                    <b style={{ display: 'block' }}>{r.productName}</b>
                    <span style={{ color: '#7b857d', fontSize: '11px' }}>Tag: {r.serialNumber || 'N/A'}</span>
                  </td>
                  <td>{r.orderNumber || '—'}</td>
                  <td>
                    <div>Bought: {r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : '—'}</div>
                    <div style={{ color: '#7b857d' }}>Expires: {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—'}</div>
                  </td>
                  <td>
                    <b style={{ color: r.remainingDays < 30 ? '#c62828' : 'var(--rf-forest-deep)' }}>
                      {r.remainingDays} Days
                    </b>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getBadgeClass(r.currentStatus || r.status)}`}>
                      {r.currentStatus || r.status}
                    </span>
                  </td>
                  <td>
                    {r.proofOfPurchase ? (
                      <a
                        href={r.proofOfPurchase}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--rf-forest-deep)', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        View Doc
                      </a>
                    ) : (
                      <span style={{ color: '#9e9e9e' }}>None</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={r.status || 'active'}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      disabled={updatingId === r.id}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: '1px solid var(--rf-line)'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="voided">Voided</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
