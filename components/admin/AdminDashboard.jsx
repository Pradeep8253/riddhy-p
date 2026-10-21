'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  Receipt,
  FileCheck,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function timeAgo(dateString) {
  if (!dateString) return 'recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export default function AdminDashboard() {
  const [range, setRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customDateError, setCustomDateError] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isCustomInvalid = Boolean(customFrom && customTo && customFrom > customTo);

  const handleFromChange = (val) => {
    setCustomFrom(val);
    if (customTo && val && val > customTo) {
      setCustomDateError('Start date cannot be after end date.');
    } else {
      setCustomDateError('');
    }
  };

  const handleToChange = (val) => {
    setCustomTo(val);
    if (customFrom && val && customFrom > val) {
      setCustomDateError('Start date cannot be after end date.');
    } else {
      setCustomDateError('');
    }
  };

  const loadData = async (selectedRange = range, from = customFrom, to = customTo) => {
    if (selectedRange === 'custom') {
      if (!from) {
        setCustomDateError('Please choose a start date.');
        return;
      }
      if (to && from > to) {
        setCustomDateError('Start date cannot be after end date.');
        return;
      }
    }
    setLoading(true);
    setRefreshing(true);
    setError('');
    setCustomDateError('');
    try {
      let query = `/api/admin/dashboard?range=${selectedRange}`;
      if (selectedRange === 'custom') {
        if (from) query += `&from=${encodeURIComponent(from)}`;
        if (to) query += `&to=${encodeURIComponent(to)}`;
      }

      const res = await fetch(query, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Dashboard telemetry unavailable.');
      }
    } catch {
      setError('Could not connect to operations telemetry database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (range !== 'custom') {
      loadData(range);
    }
  }, [range]);

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (!customFrom) {
      setCustomDateError('Please choose a start date.');
      return;
    }
    if (customTo && customFrom > customTo) {
      setCustomDateError('Start date cannot be after end date.');
      return;
    }
    setCustomDateError('');
    loadData('custom', customFrom, customTo);
  };

  const kpis = data?.kpis || {};
  const payments = data?.payments || {};
  const charts = data?.charts || {};
  const widgets = data?.widgets || {};

  const dailyTrend = charts.dailyTrend || [];
  const maxTrend = useMemo(() => {
    return Math.max(1, ...dailyTrend.map((t) => t.total || 0));
  }, [dailyTrend]);

  return (
    <div className={styles.page}>
      {/* 1. Header & Controls */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.kicker}>RF Riddhy · Operations CRM</span>
          <h1>Executive Dashboard.</h1>
          <p>
            Real-time commerce telemetry, automated payment reconciliations, GST analytics, and inventory alerts.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.rangeGroup}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'custom', label: 'Custom' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.rangeBtn} ${range === tab.id ? styles.rangeBtnActive : ''}`}
                onClick={() => {
                  setRange(tab.id);
                  setCustomDateError('');
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className={styles.customDateContainer}>
              <form
                onSubmit={handleCustomApply}
                className={`${styles.customDateBar} ${isCustomInvalid || customDateError ? styles.customDateBarError : ''}`}
              >
                <input
                  type="date"
                  lang="en-IN"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => handleFromChange(e.target.value)}
                  className={isCustomInvalid || customDateError ? styles.dateInputError : ''}
                  aria-invalid={Boolean(isCustomInvalid || customDateError)}
                  title="Start Date (From) - DD/MM/YYYY"
                  required
                />
                <span className={styles.dateSep}>to</span>
                <input
                  type="date"
                  lang="en-IN"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => handleToChange(e.target.value)}
                  className={isCustomInvalid || customDateError ? styles.dateInputError : ''}
                  aria-invalid={Boolean(isCustomInvalid || customDateError)}
                  title="End Date (To) - DD/MM/YYYY"
                />
                <button
                  type="submit"
                  className={styles.rangeBtn}
                  disabled={Boolean(isCustomInvalid || !customFrom)}
                  style={{
                    background: isCustomInvalid ? '#9ca3af' : '#1b5e20',
                    color: '#fff',
                    cursor: isCustomInvalid ? 'not-allowed' : 'pointer',
                    opacity: isCustomInvalid ? 0.6 : 1
                  }}
                >
                  Apply
                </button>
              </form>
              {(isCustomInvalid || customDateError) && (
                <div className={styles.dateErrorBadge} role="alert">
                  <span>⚠ {customDateError || 'Start date cannot be after end date.'}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => {
              if (range === 'custom' && isCustomInvalid) {
                setCustomDateError('Start date cannot be after end date.');
                return;
              }
              loadData(range, customFrom, customTo);
            }}
            disabled={refreshing}
            title="Refresh dashboard metrics"
          >
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button type="button" onClick={() => loadData(range)} style={{ background: 'transparent', border: 'none', color: '#991b1b', fontWeight: 800, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* 2. Primary KPI Cards Grid */}
      <section className={styles.kpiGrid}>
        {/* Net Revenue */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Net Revenue</span>
            <div className={styles.kpiIconWrap}><IndianRupee size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 120 }} /> : formatCurrency(kpis.netRevenue)}
          </div>
          <div className={styles.kpiFooter}>
            {kpis.revenueChange >= 0 ? (
              <span className={styles.kpiPillPositive}><TrendingUp size={11} /> +{kpis.revenueChange}%</span>
            ) : (
              <span className={styles.kpiPillNegative}><TrendingDown size={11} /> {kpis.revenueChange}%</span>
            )}
            <span>vs previous period</span>
          </div>
        </article>

        {/* Total Orders */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Total Orders</span>
            <div className={styles.kpiIconWrap}><ShoppingCart size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 80 }} /> : (kpis.totalOrders || 0)}
          </div>
          <div className={styles.kpiFooter}>
            {kpis.ordersChange >= 0 ? (
              <span className={styles.kpiPillPositive}><TrendingUp size={11} /> +{kpis.ordersChange}%</span>
            ) : (
              <span className={styles.kpiPillNegative}><TrendingDown size={11} /> {kpis.ordersChange}%</span>
            )}
            <span>vs previous period</span>
          </div>
        </article>

        {/* Average Order Value (AOV) */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Avg. Order Value</span>
            <div className={styles.kpiIconWrap}><Receipt size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 100 }} /> : formatCurrency(kpis.aov)}
          </div>
          <div className={styles.kpiFooter}>
            <span>per paid order</span>
          </div>
        </article>

        {/* Unique Customers */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Unique Customers</span>
            <div className={styles.kpiIconWrap}><Users size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 70 }} /> : (kpis.uniqueCustomers || 0)}
          </div>
          <div className={styles.kpiFooter}>
            <span>verified households</span>
          </div>
        </article>

        {/* Payment Received */}
        <article className={styles.kpiCard} style={{ borderLeft: '4px solid #1b5e20' }}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Payment Received</span>
            <div className={styles.kpiIconWrap} style={{ background: '#e8f5e9', color: '#1b5e20' }}><CheckCircle2 size={16} /></div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#1b5e20' }}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 120 }} /> : formatCurrency(kpis.paymentReceived)}
          </div>
          <div className={styles.kpiFooter}>
            <span>captured via Razorpay & Offline</span>
          </div>
        </article>

        {/* Payment Pending */}
        <article className={styles.kpiCard} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Payment Pending</span>
            <div className={styles.kpiIconWrap} style={{ background: '#fef3c7', color: '#b45309' }}><Clock size={16} /></div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#b45309' }}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 110 }} /> : formatCurrency(kpis.paymentPending)}
          </div>
          <div className={styles.kpiFooter}>
            <span>awaiting settlement or COD</span>
          </div>
        </article>

        {/* Refunds Issued */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Refunds Issued</span>
            <div className={styles.kpiIconWrap} style={{ background: '#fee2e2', color: '#b91c1c' }}><RotateCcw size={16} /></div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#b91c1c' }}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 90 }} /> : formatCurrency(kpis.refundsIssued)}
          </div>
          <div className={styles.kpiFooter}>
            <span>processed claims & returns</span>
          </div>
        </article>

        {/* GST Collected */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>GST Collected</span>
            <div className={styles.kpiIconWrap}><FileCheck size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 100 }} /> : formatCurrency(kpis.gstCollected)}
          </div>
          <div className={styles.kpiSplit}>
            CGST: {formatCurrency(kpis.gstSplit?.cgst)} · SGST: {formatCurrency(kpis.gstSplit?.sgst)} · IGST: {formatCurrency(kpis.gstSplit?.igst)}
          </div>
        </article>

        {/* Failed Payments */}
        <article className={styles.kpiCard}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Failed Payments</span>
            <div className={styles.kpiIconWrap} style={{ background: '#fef2f2', color: '#ef4444' }}><XCircle size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 50 }} /> : (kpis.failedPaymentsCount || 0)}
          </div>
          <div className={styles.kpiFooter}>
            <span>abandoned gateway checkouts</span>
          </div>
        </article>

        {/* Low Stock Alerts */}
        <Link href="/admin/inventory" className={styles.kpiCard} style={{ textDecoration: 'none' }}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Low Stock Items</span>
            <div className={styles.kpiIconWrap} style={{ background: '#fff7ed', color: '#ea580c' }}><Package size={16} /></div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#ea580c' }}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 50 }} /> : (kpis.lowStockCount || 0)}
          </div>
          <div className={styles.kpiFooter}>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>Review inventory →</span>
          </div>
        </Link>

        {/* Expiring Warranties */}
        <Link href="/admin/warranty" className={styles.kpiCard} style={{ textDecoration: 'none' }}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Expiring Warranties</span>
            <div className={styles.kpiIconWrap}><Clock size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 50 }} /> : (kpis.expiringWarranties || 0)}
          </div>
          <div className={styles.kpiFooter}>
            <span>next 30 days renewal</span>
          </div>
        </Link>

        {/* Open Claims */}
        <Link href="/admin/warranty" className={styles.kpiCard} style={{ textDecoration: 'none' }}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTitle}>Open Service Claims</span>
            <div className={styles.kpiIconWrap}><ShieldCheck size={16} /></div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? <div className={styles.skeleton} style={{ height: 32, width: 50 }} /> : (kpis.openClaims || 0)}
          </div>
          <div className={styles.kpiFooter}>
            <span style={{ color: '#1b5e20', fontWeight: 700 }}>Manage claims →</span>
          </div>
        </Link>
      </section>

      {/* 3. Payments Section: Breakdown & Outstanding Table */}
      <section className={styles.paymentsSection}>
        {/* Left: Settlement Distribution */}
        <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.panelHead}>
              <div>
                <h2>Payment Settlements</h2>
                <p>Volume distribution by status</p>
              </div>
            </div>

            <div className={styles.paymentBreakdownCard}>
              <div className={styles.progressMulti}>
                <div
                  className={styles.progressBarReceived}
                  style={{ width: `${payments.breakdown?.received?.pct || 0}%` }}
                  title={`Received: ${formatCurrency(payments.breakdown?.received?.amount)}`}
                />
                <div
                  className={styles.progressBarPending}
                  style={{ width: `${payments.breakdown?.pending?.pct || 0}%` }}
                  title={`Pending: ${formatCurrency(payments.breakdown?.pending?.amount)}`}
                />
                <div
                  className={styles.progressBarRefunded}
                  style={{ width: `${payments.breakdown?.refunded?.pct || 0}%` }}
                  title={`Refunded: ${formatCurrency(payments.breakdown?.refunded?.amount)}`}
                />
              </div>

              <div className={styles.legendList}>
                <div className={styles.legendItem}>
                  <span className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ background: '#1b5e20' }} />
                    Received ({payments.breakdown?.received?.pct || 0}%)
                  </span>
                  <span className={styles.legendValue}>{formatCurrency(payments.breakdown?.received?.amount)}</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
                    Pending ({payments.breakdown?.pending?.pct || 0}%)
                  </span>
                  <span className={styles.legendValue}>{formatCurrency(payments.breakdown?.pending?.amount)}</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ background: '#ef4444' }} />
                    Refunded ({payments.breakdown?.refunded?.pct || 0}%)
                  </span>
                  <span className={styles.legendValue}>{formatCurrency(payments.breakdown?.refunded?.amount)}</span>
                </div>
              </div>
            </div>

            <div className={styles.paymentMethodCards}>
              {(payments.methods || []).map((pm) => (
                <div key={pm.method} className={styles.methodCard}>
                  <b>{pm.label}</b>
                  <span>{formatCurrency(pm.amount)}</span>
                  <small>{pm.count} orders</small>
                </div>
              ))}
              <div className={styles.methodCard} style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                <b style={{ color: '#b45309' }}>COD To Collect</b>
                <span style={{ color: '#b45309' }}>{formatCurrency(payments.cod?.pendingAmount)}</span>
                <small>{payments.cod?.pendingCount || 0} open dispatches</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Outstanding & Pending Payments Table */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Pending & Outstanding Payments</h2>
              <p>Top orders awaiting full customer payment or COD clearance</p>
            </div>
            <Link href="/admin/orders" className={styles.panelLink}>
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Order Total</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Age</th>
                  <th>Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(payments.pendingPayments || []).length > 0 ? (
                  payments.pendingPayments.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/admin/orders?orderNumber=${row.orderNumber}`} style={{ color: '#1b5e20', fontWeight: 800, textDecoration: 'none' }}>
                          {row.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <b style={{ display: 'block', fontSize: '12px' }}>{row.customer}</b>
                        <small style={{ color: '#7a867c' }}>{row.phone}</small>
                      </td>
                      <td><b>{formatCurrency(row.total)}</b></td>
                      <td style={{ color: '#1b5e20' }}>{formatCurrency(row.paid)}</td>
                      <td>
                        <strong style={{ color: '#b45309' }}>{formatCurrency(row.balance)}</strong>
                      </td>
                      <td>
                        <span className={`${styles.ageChip} ${row.ageInDays > 7 ? styles.ageChipOld : ''}`}>
                          {row.ageInDays === 0 ? 'Today' : `${row.ageInDays}d`}
                        </span>
                      </td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 700, color: '#556257' }}>
                          {row.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/orders?orderNumber=${row.orderNumber}`} style={{ color: '#1b5e20', fontWeight: 700, fontSize: '11px', textDecoration: 'none' }}>
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#6d786f' }}>
                      No pending payments in this period. All invoices settled!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Analytics & Charts Grid */}
      <section className={styles.analyticsGrid}>
        {/* Left Column: Daily Trend & Pipeline Funnel */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Daily Revenue Trend Bar Chart */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Daily Revenue Trend</h2>
                <p>Stacked daily settlements (Paid vs Pending)</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1b5e20' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1b5e20' }} /> Paid
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} /> Pending
                </span>
              </div>
            </div>

            {dailyTrend.length > 0 ? (
              <div className={styles.chartContainer}>
                {dailyTrend.map((t, idx) => {
                  const totalHeightPct = Math.min(100, Math.max(8, Math.round((t.total / maxTrend) * 100)));
                  const receivedRatio = t.total > 0 ? t.received / t.total : 1;
                  const receivedPartHeight = Math.round(totalHeightPct * receivedRatio);
                  const pendingPartHeight = Math.max(0, totalHeightPct - receivedPartHeight);

                  return (
                    <div key={idx} className={styles.chartBarCol}>
                      <div className={styles.chartTooltip}>
                        <div>{t.date}</div>
                        <div>Paid: {formatCurrency(t.received)}</div>
                        <div>Pending: {formatCurrency(t.pending)}</div>
                        <div>Total: {formatCurrency(t.total)}</div>
                      </div>

                      <div className={styles.chartStackedBar} style={{ height: `${totalHeightPct}%` }}>
                        <div className={styles.barPartReceived} style={{ height: `${(receivedPartHeight / totalHeightPct) * 100}%` }} />
                        <div className={styles.barPartPending} style={{ height: `${(pendingPartHeight / totalHeightPct) * 100}%` }} />
                      </div>

                      <span className={styles.chartDateLabel}>
                        {dailyTrend.length <= 14 ? t.date : idx % Math.ceil(dailyTrend.length / 8) === 0 ? t.date : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>No trend telemetry yet.</h3>
                <p>Orders recorded within the selected period will render your daily revenue graph automatically.</p>
              </div>
            )}
          </div>

          {/* Orders by Status Funnel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Order Pipeline Funnel</h2>
                <p>Fulfillment lifecycle progression</p>
              </div>
            </div>

            <div className={styles.pipelineWrap}>
              {[
                { key: 'placed', label: '1. Order Placed / Cart Paid', count: charts.pipeline?.placed || 0 },
                { key: 'confirmed', label: '2. Confirmed & Packed', count: charts.pipeline?.confirmed || 0 },
                { key: 'shipped', label: '3. Shipped & Out for Delivery', count: charts.pipeline?.shipped || 0 },
                { key: 'delivered', label: '4. Delivered & Installed', count: charts.pipeline?.delivered || 0 },
                { key: 'returned', label: '5. Return / Refund Requested', count: charts.pipeline?.returned || 0 }
              ].map((step) => {
                const maxStep = Math.max(1, charts.pipeline?.placed || 1, charts.pipeline?.delivered || 1);
                const pct = Math.min(100, Math.max(6, Math.round((step.count / maxStep) * 100)));

                return (
                  <div key={step.key} className={styles.pipelineStep}>
                    <div className={styles.pipelineStepHead}>
                      <b>{step.label}</b>
                      <span>{step.count} orders</span>
                    </div>
                    <div className={styles.pipelineTrack}>
                      <div className={styles.pipelineFill} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Top Products, Categories, Geo & GST */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Top 5 Selling Products */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Top 5 Selling Products</h2>
                <p>Ranked by revenue contribution</p>
              </div>
              <Link href="/admin/catalogue" className={styles.panelLink}>
                Catalogue <ArrowRight size={14} />
              </Link>
            </div>

            {(charts.topProducts || []).length > 0 ? (
              <div className={styles.rankedList}>
                {charts.topProducts.map((p, idx) => {
                  const maxProd = Math.max(1, charts.topProducts[0]?.revenue || 1);
                  const barPct = Math.round((p.revenue / maxProd) * 100);

                  return (
                    <div key={p.sku || idx} className={styles.rankedItem}>
                      <div className={styles.rankedItemHead}>
                        <b>#{idx + 1} {p.name || p.sku}</b>
                        <span>{formatCurrency(p.revenue)}</span>
                      </div>
                      <div className={styles.rankedBarTrack}>
                        <div className={styles.rankedBarFill} style={{ width: `${barPct}%` }} />
                      </div>
                      <small style={{ color: '#7a867b', fontSize: '10px' }}>
                        {p.units || 1} units sold · SKU: {p.sku}
                      </small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No products sold in this period.</p>
              </div>
            )}
          </div>

          {/* Revenue by City / State */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Regional Performance</h2>
                <p>Top sales locations</p>
              </div>
            </div>

            {(charts.geoRevenue || []).length > 0 ? (
              <div className={styles.rankedList}>
                {charts.geoRevenue.map((g, idx) => (
                  <div key={idx} className={styles.rankedItem}>
                    <div className={styles.rankedItemHead}>
                      <b>{g.city}, {g.state}</b>
                      <span>{formatCurrency(g.revenue)}</span>
                    </div>
                    <small style={{ color: '#7a867b', fontSize: '10px' }}>{g.orders} orders delivered</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No regional sales records found for this period.</p>
              </div>
            )}
          </div>

          {/* Monthly GST Summary Table */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Statutory GST Summary</h2>
                <p>Applicable tax breakdown for filing</p>
              </div>
              <Link href="/admin/invoices" className={styles.panelLink}>
                All Invoices <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Taxable Value</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {(charts.monthlyGst || []).map((row, idx) => (
                    <tr key={idx}>
                      <td><b>{row.month}</b></td>
                      <td>{formatCurrency(row.taxable)}</td>
                      <td>{formatCurrency(row.cgst)}</td>
                      <td>{formatCurrency(row.sgst)}</td>
                      <td>{formatCurrency(row.igst)}</td>
                      <td style={{ color: '#1b5e20', fontWeight: 800 }}>{formatCurrency(row.totalTax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Row: Recent Orders, Recent Audit Feed, Low Stock */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Recent Orders */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Recent Orders</h2>
              <p>Last 8 transactions</p>
            </div>
            <Link href="/admin/orders" className={styles.panelLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {(widgets.recentOrders || []).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders?orderNumber=${o.orderNumber}`} style={{ color: '#1b5e20', fontWeight: 800, textDecoration: 'none' }}>
                        {o.orderNumber}
                      </Link>
                      <small style={{ display: 'block', color: '#7a867c' }}>{timeAgo(o.createdAt)}</small>
                    </td>
                    <td><b>{formatCurrency(o.total)}</b></td>
                    <td>
                      <span className={`${styles.badge} ${o.status === 'delivered' ? styles.badgeDelivered : o.status === 'shipped' ? styles.badgeShipped : styles.badgeGrey}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${o.paymentStatus === 'paid' ? styles.badgePaid : styles.badgePending}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Critical Stock Items</h2>
              <p>Inventory requiring procurement</p>
            </div>
            <Link href="/admin/inventory" className={styles.panelLink}>
              Inventory <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Piece Name</th>
                  <th>SKU</th>
                  <th>Available</th>
                  <th>Threshold</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(widgets.lowStockItems || []).length > 0 ? (
                  widgets.lowStockItems.map((item) => (
                    <tr key={item._id}>
                      <td><b>{item.name}</b></td>
                      <td style={{ fontSize: '11px', color: '#68746a' }}>{item.sku}</td>
                      <td>
                        <strong style={{ color: item.available <= 2 ? '#dc2626' : '#ea580c' }}>
                          {item.available} units
                        </strong>
                      </td>
                      <td>{item.lowStockAt}</td>
                      <td>
                        <Link href="/admin/inventory" style={{ color: '#1b5e20', fontWeight: 800, fontSize: '11px', textDecoration: 'none' }}>
                          Restock
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6d786f' }}>
                      All inventory stock levels are healthy!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Recent Audit Activity</h2>
              <p>Security & admin audit trail</p>
            </div>
          </div>

          <div className={styles.activityList}>
            {(widgets.recentActivity || []).length > 0 ? (
              widgets.recentActivity.map((a) => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityInfo}>
                    <b>{a.actor}</b> performed <span style={{ fontWeight: 700, color: '#1b5e20' }}>{a.action}</span> on {a.entity}
                  </div>
                  <div className={styles.activityTime}>{timeAgo(a.at)}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No recent activity logs recorded.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
