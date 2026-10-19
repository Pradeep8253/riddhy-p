'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { formatINR } from '@/lib/demo-data';
import styles from './TrackOrderClient.module.css';

const STAGES = [
  { key: 'placed', label: 'Order Placed', desc: 'Received & Verified' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Crafting & Packing' },
  { key: 'dispatched', label: 'Dispatched', desc: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Local Hub Arrival' },
  { key: 'delivered', label: 'Delivered', desc: 'Installed & Verified' }
];

function getStageIndex(status) {
  const norm = String(status || '').toLowerCase();
  if (norm === 'placed') return 0;
  if (norm === 'confirmed' || norm === 'processing') return 1;
  if (norm === 'dispatched' || norm === 'shipped') return 2;
  if (norm === 'out_for_delivery') return 3;
  if (norm === 'delivered' || norm === 'completed' || norm === 'installed') return 4;
  return 1;
}

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = async (e) => {
    e?.preventDefault();
    setError('');
    setTrackingData(null);

    const ord = orderNumber.trim();
    const ph = phone.trim().replace(/[^0-9]/g, '');

    if (!ord || ph.length < 10) {
      setError('Please provide a valid Order ID (e.g. RF26...) and a 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(ord)}&phone=${encodeURIComponent(ph)}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setTrackingData(json.data);
      } else {
        setError(json.error?.message || 'Could not find an order with these details.');
      }
    } catch (err) {
      setError('Network error while looking up order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStageIdx = trackingData ? getStageIndex(trackingData.status) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className="kicker">Real-time Fulfillment</span>
        <h1>Track Your Order & Shipment</h1>
        <p>Enter your Order Reference Number and registered phone number to view live transit updates, carrier details, and dispatch status.</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleTrack} className={styles.trackForm}>
          <div className={styles.field}>
            <label>Order Reference Number</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. RF260001 or RF-ORD-101"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className={styles.field}>
            <label>10-Digit Mobile Number</label>
            <input
              type="tel"
              className={styles.input}
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.trackBtn} disabled={isLoading}>
            {isLoading ? 'Tracking order…' : 'Track Status'}
          </button>
        </form>

        {error && <div className={styles.errorAlert}>{error}</div>}
      </div>

      {/* Tracking Result Panel */}
      {trackingData && (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <span className={styles.statusBadge}>{trackingData.status.toUpperCase()}</span>
              <h2>Order #{trackingData.orderNumber}</h2>
              <p>Placed on {new Date(trackingData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Total: {formatINR(trackingData.total)}</p>
              {trackingData.invoice?.downloadUrl && (
                <div style={{ marginTop: 10 }}>
                  <a
                    href={trackingData.invoice.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 14px',
                      background: '#1f5f2e',
                      color: '#ffffff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Icon name="receipt" size={14} />
                    <span>Download GST Invoice ({trackingData.invoice.invoiceNumber})</span>
                  </a>
                </div>
              )}
            </div>
            <div className={styles.carrierInfo}>
              <span>Carrier: <strong>{trackingData.carrier}</strong></span>
              <span>AWB / Tracking: <strong>{trackingData.trackingNumber}</strong></span>
              <span>Destination: <strong>{trackingData.shippingCity}, {trackingData.shippingState}</strong></span>
            </div>
          </div>

          {/* 5-Stage Visual Stepper */}
          <div className={styles.stepper}>
            {STAGES.map((st, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div
                  key={st.key}
                  className={`${styles.stepItem} ${isCompleted ? styles.stepCompleted : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                >
                  <div className={styles.stepDot}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className={styles.stepText}>
                    <b>{st.label}</b>
                    <span>{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ordered Items Preview */}
          <div className={styles.itemsSection}>
            <h3>Shipment Items ({trackingData.itemCount})</h3>
            <ul className={styles.itemsList}>
              {trackingData.items.map((item, idx) => (
                <li key={idx} className={styles.itemRow}>
                  <Icon name="package" size={16} />
                  <span><strong>{item.name}</strong> × {item.qty}</span>
                  <small style={{ color: '#888' }}>SKU: {item.sku}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.helpFooter}>
            <span>Need assistance with your delivery or scheduling assembly?</span>
            <Link href="/contact" className={styles.helpLink}>
              Contact White-Glove Support →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
