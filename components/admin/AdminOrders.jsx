'use client';

import { useEffect,useState } from 'react';
import { formatINR } from '@/lib/demo-data';
import styles from './AdminOrders.module.css';
const next={paid:['confirmed','cancelled'],confirmed:['processing','cancelled'],processing:['packed','cancelled'],packed:['ready_for_dispatch'],ready_for_dispatch:['shipped'],shipped:['out_for_delivery','delivery_failed'],out_for_delivery:['delivered','delivery_failed'],delivered:['installation_scheduled','installed','completed'],installation_scheduled:['installed','completed'],installed:['completed'],payment_failed:['payment_pending','cancelled'],return_requested:['returned','refund_pending','completed'],refund_pending:['returned','refunded','completed']};
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const load = () =>
    fetch('/api/admin/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrders(j.data);
        else setMessage(j.error?.message || 'Unable to load orders.');
      })
      .catch(() => setMessage('Unable to load orders.'));

  useEffect(() => {
    load();
  }, []);

  const change = async (order, status) => {
    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status, note: 'Updated in operations dashboard.' })
    });
    const json = await response.json();
    if (!response.ok || !json.success) setMessage(json.error?.message || 'Could not update order.');
    else {
      setMessage(`Order ${order.orderNumber} moved to ${status}.`);
      load();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <span className="kicker">Fulfilment desk</span>
        <h1>Orders.</h1>
        <p>Status changes follow the configured order lifecycle and write an audit record.</p>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.table}>
        <div className={styles.rowHead}>
          <span>Order</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Status / next step</span>
        </div>

        {orders.map((order) => (
          <article key={order.id} className={styles.row}>
            <div>
              <b>{order.orderNumber}</b>
              <small>{new Date(order.createdAt).toLocaleString('en-IN')}</small>
            </div>
            <div>
              <b>{order.shippingAddress?.name || 'Guest customer'}</b>
              <small>{order.email}</small>
            </div>
            <div>
              <b>{formatINR(order.total)}</b>
              <small>{order.paymentStatus}</small>
            </div>
            <div>
              <span className={styles.status}>{order.status?.replaceAll('_', ' ')}</span>
              <select
                aria-label={`Update ${order.orderNumber} status`}
                value=""
                onChange={(e) => change(order, e.target.value)}
              >
                <option value="">Choose transition</option>
                {(next[order.status] || []).map((status) => (
                  <option value={status} key={status}>
                    {status.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}

        {!orders.length && (
          <div className={styles.noData}>
            No orders recorded yet. Customer orders will appear here once placed.
          </div>
        )}
      </div>
    </div>
  );
}
