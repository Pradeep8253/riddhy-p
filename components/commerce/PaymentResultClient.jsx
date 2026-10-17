'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/demo-data';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './PaymentResultClient.module.css';

export default function PaymentResultClient({ orderId = '', email = '', hint = 'pending' }) {
  const [status, setStatus] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    if (!orderId || !email) {
      setStatus({ loading: false, data: null, error: 'Order details are missing.' });
      return;
    }

    let alive = true;
    let attempt = 0;

    const check = async () => {
      try {
        const response = await fetch(
          `/api/orders/status?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`,
          { cache: 'no-store' }
        );
        const json = await response.json();
        if (!alive) return;

        if (json.success) {
          setStatus({ loading: false, data: json.data, error: '' });
          if (json.data.paymentStatus === 'paid' || json.data.confirmed) return;
        } else if (response.status !== 404) {
          setStatus({ loading: false, data: null, error: json.error?.message || 'Status check unavailable.' });
        }
      } catch {
        if (alive) setStatus({ loading: false, data: null, error: 'Unable to check payment status.' });
      }
      attempt += 1;
      if (alive && attempt < 12) setTimeout(check, 5000);
    };

    check();
    return () => {
      alive = false;
    };
  }, [orderId, email]);

  const data = status.data;
  const paid = data?.paymentStatus === 'paid';
  const cod = data?.paymentMethod === 'cod' && data?.confirmed;

  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${paid || cod ? styles.success : ''}`}>
        {paid || cod ? <Icon name="check" size={32} /> : <Icon name="clock" size={32} />}
      </div>
      <span className="kicker">
        {paid ? 'Payment confirmed' : cod ? 'Order received' : 'Payment status'}
      </span>
      <h1>
        {paid
          ? 'Your order is in good hands.'
          : cod
          ? 'Your order is confirmed.'
          : 'We’re confirming your order.'}
      </h1>
      <p>
        {paid
          ? 'Razorpay capture was verified on the server.'
          : cod
          ? 'Cash on delivery was accepted under the store rules.'
          : hint === 'pending'
          ? 'A successful redirect alone is not proof of payment. We are checking Razorpay capture status; do not pay again until your order status updates.'
          : 'Your payment is still being checked. If no capture arrives, the order remains unpaid.'}
      </p>

      {data && (
        <div className={styles.order}>
          <span>Order reference</span>
          <b>{data.orderNumber}</b>
          <span>Status</span>
          <b>{data.status.replaceAll('_', ' ')}</b>
          <span>{cod ? 'Due on delivery' : 'Order total'}</span>
          <b>{formatINR(data.total)}</b>
        </div>
      )}

      {status.loading && <div className={styles.loading}>Checking with the store…</div>}
      {status.error && <div className={styles.error}>{status.error}</div>}

      <div className={styles.actions}>
        <Button href="/account">View your account</Button>
        <Button href="/" variant="outline">
          Continue browsing
        </Button>
      </div>
      <small>
        Questions? <Link href="/contact">Talk to Riddhy support</Link>
      </small>
    </div>
  );
}
