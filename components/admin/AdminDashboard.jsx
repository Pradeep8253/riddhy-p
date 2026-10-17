'use client';

import { useEffect,useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/demo-data';
import Icon from '@/components/ui/Icon';
import styles from './AdminDashboard.module.css';
const defaultStats={revenue:0,paidOrders:0,orders:0,pendingPayments:0,lowStockProducts:0,openWarrantyClaims:0,orderTrend:[]};
export default function AdminDashboard() {
  const [report, setReport] = useState(defaultStats);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReport(json.data);
        else setError(json.error?.message || 'Database connection unavailable. Live reports will appear once active.');
      })
      .catch(() => setError('Database connection unavailable. Live reports will appear once active.'));
  }, []);

  const bars = (report.orderTrend || []).slice(-14);
  const max = Math.max(1, ...bars.map((item) => item.amount || 0));

  return (
    <div className={styles.page}>
      <div className={styles.title}>
        <div>
          <span className="kicker">RF Riddhy · store operations</span>
          <h1>Good morning, Riddhy.</h1>
          <p>A clear view of the last 30 days. Figures are driven by live orders once your database is connected.</p>
        </div>
        <span className={styles.period}>LAST 30 DAYS</span>
      </div>

      {error && <div className={styles.notice}>{error}</div>}

      <div className={styles.metrics}>
        {[
          ['Paid revenue', formatINR(report.revenue)],
          ['Paid orders', report.paidOrders],
          ['All orders', report.orders],
          ['Payments pending', report.pendingPayments],
          ['Low-stock products', report.lowStockProducts],
          ['Open warranty claims', report.openWarrantyClaims]
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{error ? 'Awaiting live data' : 'Compared with store records'}</small>
          </article>
        ))}
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className="kicker">Order activity</span>
              <h2>Recent activity</h2>
            </div>
            <Link href="/admin/orders">
              View orders <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className={styles.chart}>
            {bars.length ? (
              bars.map((item, index) => (
                <div
                  key={`${item.date}-${index}`}
                  title={`${formatINR(item.amount)} · ${item.status}`}
                  style={{ height: `${Math.max(8, (item.amount / max) * 100)}%` }}
                />
              ))
            ) : (
              Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ height: `${25 + ((i * 19) % 64)}%` }} />
              ))
            )}
            <span>Order volume trend</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className="kicker">Quick actions</span>
              <h2>Store desk</h2>
            </div>
          </div>
          <div className={styles.shortcuts}>
            {[
              ['Add / update product', '/admin/catalogue'],
              ['Update campaign banners', '/admin/cms'],
              ['Review orders', '/admin/orders'],
              ['Store settings & brand proof', '/admin/settings'],
              ['Reports & KPIs', '/admin/reports']
            ].map(([title, href]) => (
              <Link href={href} key={href}>
                <Icon name="arrowUpRight" size={14} />
                {title}
              </Link>
            ))}
          </div>
          <p className={styles.small}>
            Changes made in admin routes are role-checked and written to the audit log where implemented.
          </p>
        </section>
      </div>

      <p className={styles.footnote}>
        Figures reflect real customer orders, catalogue adjustments and verified payments.
      </p>
    </div>
  );
}
