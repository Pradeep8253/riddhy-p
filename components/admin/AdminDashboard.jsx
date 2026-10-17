'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '@/lib/demo-data';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${selectedRange}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Database live reports unavailable.');
      }
    } catch {
      setError('Database live reports unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const kpis = data?.kpis || {
    revenue: 0,
    revenueChange: 0,
    orders: 0,
    ordersChange: 0,
    aov: 0,
    newCustomers: 0,
    pendingPayments: 0,
    lowStockCount: 0,
    expiringWarranties: 0,
    openClaims: 0
  };

  const trend = data?.revenueTrend || [];
  const maxTrend = Math.max(1, ...trend.map((t) => t.revenue || 0));
  const topProducts = data?.topProducts || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.title}>
        <div>
          <span className="kicker" style={{ fontSize: '11px', fontWeight: 800, color: '#1b5e20', textTransform: 'uppercase' }}>
            RF Riddhy · Operations CRM
          </span>
          <h1>Executive Dashboard.</h1>
          <p>Real-time commerce telemetry, order pipelines, statutory revenue metrics, and inventory alerts.</p>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', gap: '6px', background: '#f4efe7', padding: '4px', borderRadius: '8px' }}>
          {['today', '7d', '30d'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                background: range === r ? '#1b5e20' : 'transparent',
                color: range === r ? '#ffffff' : '#4a574e',
                transition: 'all 0.15s'
              }}
            >
              {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.notice}>{error}</div>}

      {/* 8 Primary CRM KPI Cards */}
      <div className={styles.metrics} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <article>
          <span>Net Revenue</span>
          <b>{formatINR(kpis.revenue)}</b>
          <small style={{ color: kpis.revenueChange >= 0 ? '#1b5e20' : '#b71c1c', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {kpis.revenueChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{kpis.revenueChange >= 0 ? `+${kpis.revenueChange}%` : `${kpis.revenueChange}%`} vs prev period</span>
          </small>
        </article>

        <article>
          <span>Total Orders</span>
          <b>{kpis.orders}</b>
          <small style={{ color: kpis.ordersChange >= 0 ? '#1b5e20' : '#b71c1c', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {kpis.ordersChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{kpis.ordersChange >= 0 ? `+${kpis.ordersChange}%` : `${kpis.ordersChange}%`} volume</span>
          </small>
        </article>

        <article>
          <span>Average Order Value</span>
          <b>{formatINR(kpis.aov)}</b>
          <small>Per paid transaction</small>
        </article>

        <article>
          <span>Unique Customers</span>
          <b>{kpis.newCustomers}</b>
          <small>Active buyers in window</small>
        </article>

        <article>
          <span>Pending Payments</span>
          <b style={{ color: kpis.pendingPayments > 0 ? '#b2533e' : '#1b5e20' }}>{kpis.pendingPayments}</b>
          <small>Uncaptured checkout attempts</small>
        </article>

        <article>
          <span>Low-Stock Alerts</span>
          <b style={{ color: kpis.lowStockCount > 0 ? '#c62828' : '#1b5e20' }}>{kpis.lowStockCount}</b>
          <small>≤ 5 units remaining</small>
        </article>

        <article>
          <span>Expiring Warranties</span>
          <b style={{ color: kpis.expiringWarranties > 0 ? '#d97706' : '#1b5e20' }}>{kpis.expiringWarranties}</b>
          <small>Within next 30 days</small>
        </article>

        <article>
          <span>Open Service Claims</span>
          <b style={{ color: kpis.openClaims > 0 ? '#c62828' : '#1b5e20' }}>{kpis.openClaims}</b>
          <small>Care desk SLA queue</small>
        </article>
      </div>

      {/* Main Grid: Revenue Trend & Top Products / Activity Feed */}
      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className="kicker">Revenue Telemetry</span>
              <h2>Daily Order Revenue Trend</h2>
            </div>
            <Link href="/admin/orders">
              View all orders <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          <div className={styles.chart}>
            {trend.length > 0 ? (
              trend.map((item, idx) => {
                const heightPercent = Math.max(8, Math.round((item.revenue / maxTrend) * 100));
                return (
                  <div
                    key={idx}
                    title={`${item.date}: ${formatINR(item.revenue)}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })
            ) : (
              Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ height: `${25 + ((i * 17) % 65)}%` }} />
              ))
            )}
            <span>Daily captured gross (INR)</span>
          </div>

          {/* Top Products In Period */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1b2e23', marginBottom: '12px' }}>
              Top Products by Sales
            </h3>
            {topProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topProducts.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#faf8f5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <strong>{p.name}</strong>
                      <span style={{ color: '#727e74', marginLeft: '6px' }}>({p.sku})</span>
                    </div>
                    <div>
                      <span style={{ marginRight: '12px', color: '#68736a' }}>{p.units} units</span>
                      <strong style={{ color: '#1b5e20' }}>{formatINR(p.revenue)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#727e74' }}>No completed orders in this window.</p>
            )}
          </div>
        </section>

        {/* Right Side: Quick Actions & Live Activity Feed */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className="kicker">Operational Feed</span>
              <h2>Recent Audit Activity</h2>
            </div>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '8px 10px',
                    borderLeft: '3px solid #1b5e20',
                    background: '#faf8f5',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1b2e23' }}>
                    {act.action?.replace(/_/g, ' ')}
                  </div>
                  <div style={{ color: '#727e74', marginTop: '2px' }}>
                    {act.actor} · {new Date(act.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: '#727e74' }}>Audit activity logs will populate as operations occur.</p>
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1b2e23', marginBottom: '10px' }}>
              Quick Navigation
            </h3>
            <div className={styles.shortcuts}>
              <Link href="/admin/catalogue">Product Catalogue &amp; Stock</Link>
              <Link href="/admin/merchandising">Merchandising Rails</Link>
              <Link href="/admin/orders">Orders &amp; Shipments</Link>
              <Link href="/admin/invoices">Statutory GST Invoices</Link>
              <Link href="/admin/warranty">Warranty &amp; Review Desk</Link>
              <Link href="/admin/settings">Store Settings &amp; GSTIN</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
