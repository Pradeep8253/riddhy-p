'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { formatINR } from '@/lib/demo-data';
import { formatDateDDMMYYYY } from '@/lib/date-utils';
import {
  Search,
  X,
  FileText,
  Eye,
  Filter,
  Package,
  CreditCard,
  Truck,
  RotateCcw
} from 'lucide-react';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import AdminOrderDrawer from './AdminOrderDrawer';
import styles from './AdminOrders.module.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'installation_scheduled', label: 'Installation Scheduled' },
  { value: 'installed', label: 'Installed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selected Order for CRM Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (methodFilter !== 'all') params.set('paymentMethod', methodFilter);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data || []);
        setTotal(data.meta?.total || 0);
      } else {
        setMessage(data.error?.message || 'Unable to load orders.');
      }
    } catch (err) {
      setMessage('Error connecting to order operations API.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, methodFilter, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const exportColumns = [
    { label: 'Order Number', key: 'orderNumber' },
    { label: 'Date', key: 'createdAt', getValue: (o) => formatDateDDMMYYYY(o.createdAt) },
    { label: 'Customer Name', key: 'customer', getValue: (o) => o.shippingAddress?.name || 'Customer' },
    { label: 'City', key: 'city', getValue: (o) => o.shippingAddress?.city || '' },
    { label: 'Phone', key: 'phone' },
    { label: 'Items', key: 'items', getValue: (o) => o.items?.length || 1 },
    { label: 'Payment Method', key: 'paymentMethod' },
    { label: 'Payment Status', key: 'paymentStatus' },
    { label: 'Total (₹)', key: 'total' },
    { label: 'Order Status', key: 'status' },
    { label: 'Invoice No', key: 'invoiceNumber' }
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div>
          <span className="kicker">Fulfilment Desk</span>
          <h1>Orders &amp; Shipments.</h1>
          <p>
            Enterprise order lifecycle, payment ledger reconciliation, statutory GST invoicing, and dispatch tracking.
          </p>
        </div>
        <div className={styles.tools}>
          <ExportDropdown
            title="Orders Export"
            filename={`orders-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={orders}
            apiEndpoint="/api/admin/orders/export"
            queryParams={`status=${statusFilter}&paymentStatus=${paymentFilter}`}
          />
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={15} style={{ color: '#68736a' }} />
          <input
            type="text"
            placeholder="Search order #, customer, phone, email, invoice #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filtersGroup}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by order status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment status"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="unpaid">Unpaid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment method"
          >
            <option value="all">All Methods</option>
            <option value="razorpay">Razorpay (Online)</option>
            <option value="cod">Cash on Delivery</option>
            <option value="offline">Offline / POS</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.table}>
        <div className={styles.rowHead} style={{ gridTemplateColumns: '1.2fr 1.3fr 1fr 1.2fr 0.8fr' }}>
          <span>Order &amp; Date</span>
          <span>Customer &amp; Address</span>
          <span>Amount &amp; Payment</span>
          <span>Lifecycle Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {loading ? (
          <div className={styles.noData}>Loading orders from server...</div>
        ) : orders.length === 0 ? (
          <div className={styles.noData}>
            No orders match the selected filters or search query.
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className={styles.row}
              style={{ gridTemplateColumns: '1.2fr 1.3fr 1fr 1.2fr 0.8fr', cursor: 'pointer' }}
              onClick={() => setSelectedOrder(order)}
            >
              <div>
                <b>{order.orderNumber}</b>
                <small>{formatDateDDMMYYYY(order.createdAt)}</small>
                {order.invoiceNumber && (
                  <span style={{ fontSize: '10px', color: '#1b5e20', fontWeight: 700 }}>
                    Inv: {order.invoiceNumber}
                  </span>
                )}
                <span className={styles.itemCountBadge}>
                  {order.items?.length || 1} item{order.items?.length === 1 ? '' : 's'}
                </span>
              </div>

              <div>
                <b>{order.shippingAddress?.name || 'Customer'}</b>
                <small>{order.phone || order.shippingAddress?.phone || 'No phone'}</small>
                <small>{order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''}</small>
              </div>

              <div>
                <b>{formatINR(order.total)}</b>
                <span
                  className={`${styles.payPill} ${
                    order.paymentStatus === 'paid'
                      ? styles.payPaid
                      : order.paymentStatus === 'failed'
                      ? styles.payFailed
                      : styles.payPending
                  }`}
                >
                  {order.paymentStatus} · {order.paymentMethod?.toUpperCase()}
                </span>
              </div>

              <div>
                <span className={`${styles.status} ${styles['status_' + order.status]}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
                {order.deliveredAt && (
                  <small style={{ color: '#17632a' }}>
                    Delivered {formatDateDDMMYYYY(order.deliveredAt)}
                  </small>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  className={styles.rowBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  title="Open Order Details"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d5cec2',
                    background: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={12} />
                  <span>View</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <AdminPagination
        currentPage={page}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        itemLabel="orders"
      />

      {/* Slide-over CRM Order Drawer */}
      <AdminOrderDrawer
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={() => {
          setSelectedOrder(null);
          fetchOrders();
        }}
      />
    </div>
  );
}
