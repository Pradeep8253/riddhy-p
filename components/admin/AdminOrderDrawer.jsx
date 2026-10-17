'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X,
  FileText,
  CreditCard,
  Truck,
  History,
  AlertTriangle,
  Download,
  Printer,
  CheckCircle,
  Package,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { formatINR } from '@/lib/demo-data';
import { ALLOWED_TRANSITIONS } from '@/lib/order-state';
import styles from './AdminOrderDrawer.module.css';

export default function AdminOrderDrawer({ isOpen, order, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [targetStatus, setTargetStatus] = useState('');
  const [transitionNote, setTransitionNote] = useState('');

  // Offline payment form
  const [payAmount, setPayAmount] = useState(order ? (order.total - (order.refundedAmount || 0)) : 0);
  const [payMode, setPayMode] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Refund form
  const [refundAmount, setRefundAmount] = useState(order ? order.total : 0);
  const [refundReason, setRefundReason] = useState('Customer return / cancellation');

  if (!isOpen || !order) return null;

  const showFeedback = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4500);
  };

  const handleStatusTransition = async () => {
    if (!targetStatus) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order._id,
          action: 'transition',
          status: targetStatus,
          note: transitionNote || `Transitioned to ${targetStatus}`
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Transition failed');
      }
      showFeedback(`Order moved to ${targetStatus.replace(/_/g, ' ')}.`);
      setTargetStatus('');
      setTransitionNote('');
      onUpdated();
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order._id,
          action: 'recordPayment',
          payment: {
            amount: Number(payAmount),
            mode: payMode,
            reference: payRef,
            notes: payNotes
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Payment recording failed');
      }
      showFeedback(`Payment of ₹${payAmount} recorded successfully.`);
      onUpdated();
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleCollectCod = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order._id,
          action: 'markCodCollected'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'COD update failed');
      showFeedback('COD marked as collected.');
      onUpdated();
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order._id,
          action: 'issueInvoice'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Invoice generation failed');
      showFeedback('Invoice generated successfully.');
      onUpdated();
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order._id,
          action: 'processRefund',
          refund: {
            amount: Number(refundAmount),
            reason: refundReason
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Refund processing failed');
      showFeedback(`Refund of ₹${refundAmount} processed and credit note generated.`);
      onUpdated();
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const orderId = order.id || order._id;
  const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
  const items = order.items || [];
  const timeline = order.timeline || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2>Order {order.orderNumber}</h2>
            <span
              className={styles.badge}
              style={{
                background: order.status === 'delivered' || order.status === 'completed' ? '#eaf5ec' : '#fff3df',
                color: order.status === 'delivered' || order.status === 'completed' ? '#17632a' : '#925400'
              }}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banners */}
        {error && <div style={{ background: '#fde8e8', color: '#bc1c1c', padding: '10px 24px', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ background: '#eaf5ec', color: '#17632a', padding: '10px 24px', fontSize: '13px' }}>{success}</div>}

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`} onClick={() => setActiveTab('summary')}>
            Summary
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'items' ? styles.tabActive : ''}`} onClick={() => setActiveTab('items')}>
            Items ({items.length})
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'payments' ? styles.tabActive : ''}`} onClick={() => setActiveTab('payments')}>
            Payment &amp; Ledger
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'invoice' ? styles.tabActive : ''}`} onClick={() => setActiveTab('invoice')}>
            GST Invoice
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'shipment' ? styles.tabActive : ''}`} onClick={() => setActiveTab('shipment')}>
            Shipment
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'timeline' ? styles.tabActive : ''}`} onClick={() => setActiveTab('timeline')}>
            Timeline ({timeline.length})
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'refund' ? styles.tabActive : ''}`} onClick={() => setActiveTab('refund')}>
            Refund / Credit Note
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.content}>
          {activeTab === 'summary' && (
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Package size={15} /> Customer &amp; Shipping
                </div>
                <div className={styles.grid2}>
                  <div className={styles.infoBox}>
                    <h4>Recipient / Shipping</h4>
                    <p><strong>{order.shippingAddress?.name || 'Customer'}</strong></p>
                    <p>{order.shippingAddress?.line1} {order.shippingAddress?.line2}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                    <p>Phone: {order.phone || order.shippingAddress?.phone || 'N/A'}</p>
                    <p>Email: {order.email || 'N/A'}</p>
                  </div>
                  <div className={styles.infoBox}>
                    <h4>Billing &amp; Tax</h4>
                    <p><strong>{order.billingAddress?.name || order.shippingAddress?.name}</strong></p>
                    <p>{order.billingAddress?.line1 || order.shippingAddress?.line1}</p>
                    <p>{order.billingAddress?.city || order.shippingAddress?.city}, {order.billingAddress?.state || order.shippingAddress?.state} - {order.billingAddress?.pincode || order.shippingAddress?.pincode}</p>
                    <p>Payment Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
                    <p>Payment Status: <strong>{order.paymentStatus?.toUpperCase()}</strong></p>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <DollarSign size={15} /> Financial Breakdown
                </div>
                <div className={styles.infoBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Subtotal:</span>
                    <span>{formatINR(order.subtotal || order.total)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2e7d32' }}>
                      <span>Discount:</span>
                      <span>-{formatINR(order.discount)}</span>
                    </div>
                  )}
                  {order.deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Delivery Fee:</span>
                      <span>{formatINR(order.deliveryFee)}</span>
                    </div>
                  )}
                  {order.installationFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Installation Fee:</span>
                      <span>{formatINR(order.installationFee)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #d5cec2', fontWeight: 800, fontSize: '15px' }}>
                    <span>Total Amount:</span>
                    <span>{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Transition Control */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <ArrowRight size={15} /> Lifecycle State Transition
                </div>
                <div className={styles.infoBox}>
                  <p style={{ marginBottom: '10px' }}>
                    Current State: <strong>{order.status.replace(/_/g, ' ')}</strong>
                  </p>
                  {allowedNext.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        className={styles.formSelect}
                        style={{ maxWidth: '220px' }}
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                      >
                        <option value="">Move to next state...</option>
                        {allowedNext.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Transition note (optional)"
                        className={styles.formInput}
                        style={{ flex: 1, minWidth: '180px' }}
                        value={transitionNote}
                        onChange={(e) => setTransitionNote(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleStatusTransition}
                        disabled={!targetStatus || busy}
                      >
                        Update State
                      </button>
                    </div>
                  ) : (
                    <p style={{ color: '#727e74' }}>This order has reached a terminal status.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.warrantySnapshot && (
                          <div style={{ fontSize: '11px', color: '#1b5e20', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <ShieldCheck size={12} />
                            <span>Warranty: {item.warrantySnapshot.seller || item.warrantySnapshot.manufacturer || 'Active'}</span>
                          </div>
                        )}
                      </td>
                      <td>{item.sku}</td>
                      <td>{item.qty}</td>
                      <td>{formatINR(item.unitPrice)}</td>
                      <td><strong>{formatINR(item.lineTotal || item.unitPrice * item.qty)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <CreditCard size={15} /> Payment Status &amp; Ledger
                </div>
                <div className={styles.grid2}>
                  <div className={styles.infoBox}>
                    <h4>Status &amp; Collection</h4>
                    <p>Status: <strong>{order.paymentStatus?.toUpperCase()}</strong></p>
                    <p>Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
                    <p>Total Paid: <strong>{order.paymentStatus === 'paid' ? formatINR(order.total) : formatINR(order.offlinePayment?.amount || 0)}</strong></p>
                    {order.refundedAmount > 0 && (
                      <p style={{ color: '#bc1c1c' }}>Refunded: <strong>{formatINR(order.refundedAmount)}</strong></p>
                    )}
                  </div>
                  <div className={styles.infoBox}>
                    <h4>COD Collection</h4>
                    {order.paymentMethod === 'cod' ? (
                      order.codCollectedAt ? (
                        <p style={{ color: '#17632a' }}>COD collected on {new Date(order.codCollectedAt).toLocaleString('en-IN')}</p>
                      ) : (
                        <div>
                          <p style={{ color: '#925400', marginBottom: '8px' }}>Pending cash collection upon delivery.</p>
                          <button type="button" className={styles.btnPrimary} onClick={handleCollectCod} disabled={busy}>
                            Mark COD Collected
                          </button>
                        </div>
                      )
                    ) : (
                      <p>Not a COD order.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Record Offline Payment Form */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <DollarSign size={15} /> Record Offline / POS Payment
                </div>
                <form onSubmit={handleRecordPayment} className={styles.infoBox}>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Amount (₹)</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Payment Mode</label>
                      <select
                        className={styles.formSelect}
                        value={payMode}
                        onChange={(e) => setPayMode(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI / QR</option>
                        <option value="pos">POS / Card Terminal</option>
                        <option value="bank_transfer">Bank Transfer / NEFT</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Reference / Transaction ID</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. UPI Ref / Cheque No."
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Notes</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Additional remarks"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.btnPrimary} disabled={busy}>
                    Save Offline Payment &amp; Issue Receipt
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <FileText size={15} /> Statutory GST Invoice
                </div>
                <div className={styles.infoBox}>
                  {order.invoiceNumber ? (
                    <div>
                      <p>Invoice Number: <strong>{order.invoiceNumber}</strong></p>
                      <p>Total Invoice Value: <strong>{formatINR(order.total)}</strong> (Inclusive of 18% GST)</p>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <a
                          href={`/api/orders/${orderId}/invoice.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.btnPrimary}
                        >
                          <Download size={14} /> Download Invoice (PDF)
                        </a>
                        <a
                          href={`/api/orders/${orderId}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.btnSecondary}
                        >
                          <Printer size={14} /> Print / HTML View
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#727e74', marginBottom: '12px' }}>
                        No invoice has been generated for this order yet. Invoices are generated automatically on payment or confirmation.
                      </p>
                      <button type="button" className={styles.btnPrimary} onClick={handleGenerateInvoice} disabled={busy}>
                        Generate Statutory Invoice Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipment' && (
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Truck size={15} /> Delivery &amp; Installation
                </div>
                <div className={styles.infoBox}>
                  <p>Destination: <strong>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</strong></p>
                  <p>Delivered At: <strong>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-IN') : 'Not yet delivered'}</strong></p>
                  <p>Installed At: <strong>{order.installedAt ? new Date(order.installedAt).toLocaleString('en-IN') : 'Not yet installed'}</strong></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <div className={styles.timelineList}>
                {timeline.map((event, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineText}>
                      {event.note || `Moved to ${event.status}`}
                    </div>
                    <div className={styles.timelineMeta}>
                      {new Date(event.at).toLocaleString('en-IN')} · By {event.byEmail || 'System'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <RotateCcw size={15} /> Process Refund &amp; Credit Note
                </div>
                <form onSubmit={handleProcessRefund} className={styles.infoBox}>
                  <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>
                    Statutory Rule: Processing a refund generates an official Credit Note in series <code>RF/CN/YYYY-YY/NNNNNN</code> and releases reserved stock.
                  </p>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Refund Amount (₹)</label>
                    <input
                      type="number"
                      max={order.total - (order.refundedAmount || 0)}
                      className={styles.formInput}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Reason for Refund</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.btnDanger} disabled={busy || refundAmount <= 0}>
                    Issue Credit Note &amp; Refund ₹{refundAmount}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div style={{ fontSize: '12px', color: '#68736a' }}>
            Created {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </div>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
