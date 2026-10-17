'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Download, Printer, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/demo-data';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import styles from './AdminInvoices.module.css';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    taxableTotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    grandTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fyFilter, setFyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (fyFilter !== 'all') params.set('financialYear', fyFilter);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoices(data.data || []);
        setTotal(data.meta?.total || 0);
        if (data.meta?.summary) setSummary(data.meta.summary);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [search, fyFilter, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const exportColumns = [
    { label: 'Invoice No', key: 'invoiceNumber' },
    { label: 'Date', key: 'invoiceDate', getValue: (i) => new Date(i.invoiceDate).toLocaleDateString('en-IN') },
    { label: 'Order No', key: 'orderNumber' },
    { label: 'Buyer', key: 'buyer', getValue: (i) => i.buyer?.name || 'Customer' },
    { label: 'GSTIN', key: 'gstin', getValue: (i) => i.buyer?.gstin || 'URP' },
    { label: 'Taxable (₹)', key: 'taxableAmount' },
    { label: 'Total Tax (₹)', key: 'totalTax' },
    { label: 'Total Amount (₹)', key: 'totalAmount' }
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div>
          <span className="kicker" style={{ fontSize: '11px', fontWeight: 800, color: '#1b5e20', textTransform: 'uppercase' }}>
            Statutory Accounting &amp; Compliance
          </span>
          <h1>GST Tax Invoices.</h1>
          <p>
            Sequential invoice series per financial year, CGST/SGST/IGST tax splits, credit notes, and accountant exports.
          </p>
        </div>
        <div>
          <ExportDropdown
            title="GST Invoices Export"
            filename={`gst-invoices-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={invoices}
            apiEndpoint="/api/admin/invoices/export"
            queryParams={`financialYear=${fyFilter}`}
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Invoiced Revenue</div>
          <div className={styles.kpiValue}>{formatINR(summary.grandTotal)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Taxable Value</div>
          <div className={styles.kpiValue}>{formatINR(summary.taxableTotal)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>CGST + SGST (Intra-state)</div>
          <div className={styles.kpiValue}>{formatINR(summary.cgstTotal + summary.sgstTotal)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>IGST (Inter-state)</div>
          <div className={styles.kpiValue}>{formatINR(summary.igstTotal)}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={15} color="#68736a" />
          <input
            type="text"
            placeholder="Search invoice #, order #, buyer name, or GSTIN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <select
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d5cec2', fontSize: '13px' }}
            value={fyFilter}
            onChange={(e) => {
              setFyFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Financial Years</option>
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Order No</th>
              <th>Buyer / Recipient</th>
              <th>Place of Supply</th>
              <th style={{ textAlign: 'right' }}>Taxable (₹)</th>
              <th style={{ textAlign: 'right' }}>GST (18%) (₹)</th>
              <th style={{ textAlign: 'right' }}>Total Amount (₹)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className={styles.empty}>Loading invoices...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>No invoices found matching criteria.</td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const totalGst = (inv.cgstTotal || 0) + (inv.sgstTotal || 0) + (inv.igstTotal || 0);
                return (
                  <tr key={inv.id}>
                    <td>
                      <strong>{inv.invoiceNumber}</strong>
                      <div style={{ fontSize: '10px', color: '#727e74' }}>FY: {inv.financialYear}</div>
                    </td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <Link href={`/admin/orders`} style={{ color: '#1b5e20', fontWeight: 600 }}>
                        {inv.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div><strong>{inv.buyer?.name || 'Customer'}</strong></div>
                      {inv.buyer?.gstin && <div style={{ fontSize: '10px', color: '#555' }}>GSTIN: {inv.buyer.gstin}</div>}
                    </td>
                    <td>{inv.placeOfSupply || 'West Bengal'}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(inv.taxableAmount)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {formatINR(totalGst)}
                      <div style={{ fontSize: '10px', color: '#727e74' }}>
                        {inv.isInterState ? 'IGST' : 'CGST+SGST'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}><strong>{formatINR(inv.totalAmount)}</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <a
                          href={`/api/orders/${inv.orderId}/invoice.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.btnAction}
                          title="Download PDF"
                        >
                          <Download size={12} /> PDF
                        </a>
                        <a
                          href={`/api/orders/${inv.orderId}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.btnAction}
                          title="Print HTML"
                        >
                          <Printer size={12} /> Print
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Totals Row */}
            {!loading && invoices.length > 0 && (
              <tr className={styles.totalsRow}>
                <td colSpan={5}>PAGE / ACCUMULATED TOTALS:</td>
                <td style={{ textAlign: 'right' }}>{formatINR(summary.taxableTotal)}</td>
                <td style={{ textAlign: 'right' }}>{formatINR(summary.cgstTotal + summary.sgstTotal + summary.igstTotal)}</td>
                <td style={{ textAlign: 'right' }}>{formatINR(summary.grandTotal)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        itemLabel="invoices"
      />
    </div>
  );
}
