'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  FileText,
  Mail,
  Share2,
  AlertTriangle,
  RotateCcw,
  Ban,
  Eye,
  CheckCircle,
  Copy
} from 'lucide-react';
import { formatINR } from '@/lib/demo-data';
import { formatDateDDMMYYYY } from '@/lib/date-utils';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import { Badge, Modal, ConfirmDialog, EmptyState, Skeleton } from './ui';
import styles from './AdminInvoices.module.css';

export default function AdminInvoices() {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'credit_notes'
  const [invoices, setInvoices] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    taxableTotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    totalTax: 0,
    paidTotal: 0,
    unpaidTotal: 0,
    creditNotesTotal: 0
  });
  const [companyValidation, setCompanyValidation] = useState({ valid: true, errors: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [fyFilter, setFyFilter] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [buyerType, setBuyerType] = useState('all');
  const [stateType, setStateType] = useState('all');
  const [hasCreditNote, setHasCreditNote] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateRangeError, setDateRangeError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Toast / Feedback
  const [toast, setToast] = useState(null);

  // Modal states
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [emailModal, setEmailModal] = useState({ isOpen: false, invoice: null, email: '', isSending: false });
  const [creditNoteModal, setCreditNoteModal] = useState({ isOpen: false, invoice: null, amount: '', reason: '', isSubmitting: false });
  const [voidConfirm, setVoidConfirm] = useState({ isOpen: false, invoice: null, reason: 'Voided by administrative request' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchInvoices = useCallback(async () => {
    if (fromDate && toDate && fromDate > toDate) {
      showToast('From date cannot be after To date', 'error');
      setDateRangeError('From date cannot be after To date');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (fyFilter !== 'all') params.set('financialYear', fyFilter);
      if (paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (buyerType !== 'all') params.set('buyerType', buyerType);
      if (stateType !== 'all') params.set('stateType', stateType);
      if (hasCreditNote !== 'all') params.set('hasCreditNote', hasCreditNote);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      if (activeTab === 'credit_notes') params.set('type', 'credit_notes');
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      if (!res.ok) {
        if (activeTab === 'credit_notes') setCreditNotes([]);
        else setInvoices([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (activeTab === 'credit_notes') {
          setCreditNotes(data.data || []);
        } else {
          setInvoices(data.data || []);
        }
        setTotal(data.meta?.total || 0);
        if (data.meta?.summary) setSummary(data.meta.summary);
        if (data.meta?.companyValidation) setCompanyValidation(data.meta.companyValidation);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, fyFilter, paymentStatus, buyerType, stateType, hasCreditNote, fromDate, toDate, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const resetFilters = () => {
    setSearch('');
    setFyFilter('all');
    setPaymentStatus('all');
    setBuyerType('all');
    setStateType('all');
    setHasCreditNote('all');
    setFromDate('');
    setToDate('');
    setDateRangeError('');
    setPage(1);
  };

  // Row Action: Send Email
  const handleSendEmail = async () => {
    if (!emailModal.invoice || !emailModal.email.trim()) return;
    setEmailModal((prev) => ({ ...prev, isSending: true }));
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email',
          invoiceId: emailModal.invoice.id,
          email: emailModal.email.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.data?.message || 'Invoice emailed successfully!');
        setEmailModal({ isOpen: false, invoice: null, email: '', isSending: false });
        fetchInvoices();
      } else {
        showToast(data.error?.message || 'Failed to email invoice.', 'error');
        setEmailModal((prev) => ({ ...prev, isSending: false }));
      }
    } catch (err) {
      showToast('Error emailing invoice.', 'error');
      setEmailModal((prev) => ({ ...prev, isSending: false }));
    }
  };

  // Row Action: Copy WhatsApp Link
  const handleCopyWhatsApp = (inv) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rfriddhy.com';
    const invoicePdfUrl = `${origin}/api/orders/${inv.orderId}/invoice.pdf`;
    const message = `Hello ${inv.buyer?.name || 'Customer'},\nHere is your official GST Tax Invoice ${inv.invoiceNumber} for Order ${inv.orderNumber}:\n${invoicePdfUrl}\n\nThank you for choosing RF Riddhy!`;
    navigator.clipboard.writeText(message);
    showToast('WhatsApp message & invoice link copied to clipboard!');
  };

  // Row Action: Issue Credit Note
  const handleIssueCreditNote = async () => {
    if (!creditNoteModal.invoice || !creditNoteModal.amount) return;
    setCreditNoteModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'credit_note',
          orderId: creditNoteModal.invoice.orderId,
          amount: Number(creditNoteModal.amount),
          reason: creditNoteModal.reason || 'Goods return / price adjustment'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.data?.message || 'Credit note issued successfully!');
        setCreditNoteModal({ isOpen: false, invoice: null, amount: '', reason: '', isSubmitting: false });
        fetchInvoices();
      } else {
        showToast(data.error?.message || 'Failed to issue credit note.', 'error');
        setCreditNoteModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      showToast('Error issuing credit note.', 'error');
      setCreditNoteModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Row Action: Void Invoice
  const handleVoidInvoice = async () => {
    if (!voidConfirm.invoice) return;
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'void',
          invoiceId: voidConfirm.invoice.id,
          reason: voidConfirm.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.data?.message || 'Invoice voided successfully.');
        setVoidConfirm({ isOpen: false, invoice: null, reason: '' });
        fetchInvoices();
      } else {
        showToast(data.error?.message || 'Cannot void invoice.', 'error');
      }
    } catch (err) {
      showToast('Error voiding invoice.', 'error');
    }
  };

  const exportColumns = [
    { label: 'Invoice No', key: 'invoiceNumber' },
    { label: 'Date', key: 'invoiceDate', getValue: (i) => formatDateDDMMYYYY(i.invoiceDate) },
    { label: 'Order No', key: 'orderNumber' },
    { label: 'Buyer', key: 'buyer', getValue: (i) => i.buyer?.businessName || i.buyer?.name || 'Customer' },
    { label: 'Buyer GSTIN', key: 'gstin', getValue: (i) => i.buyer?.gstin || 'URP' },
    { label: 'Place of Supply', key: 'placeOfSupply' },
    { label: 'Taxable (₹)', key: 'taxableAmount' },
    { label: 'CGST (₹)', key: 'cgstTotal' },
    { label: 'SGST (₹)', key: 'sgstTotal' },
    { label: 'IGST (₹)', key: 'igstTotal' },
    { label: 'Total Tax (₹)', key: 'totalTax' },
    { label: 'Total Amount (₹)', key: 'totalAmount' },
    { label: 'Status', key: 'status' }
  ];

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: toast.type === 'error' ? '#991b1b' : '#1b5e20',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.head}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#1b5e20', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Statutory Accounting &amp; Compliance
          </span>
          <h1>GST Tax Invoices &amp; Credit Notes</h1>
          <p>
            Sequential invoice series per financial year, multi-rate GST, reverse-calculated tax splits, GSTR-1 &amp; Tally exports.
          </p>
        </div>
        <div>
          <ExportDropdown
            title="GST Invoices Export"
            filename={`gst-invoices-${fyFilter}-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={invoices}
            apiEndpoint="/api/admin/invoices/export"
            queryParams={`financialYear=${fyFilter}&paymentStatus=${paymentStatus}&buyerType=${buyerType}&stateType=${stateType}`}
          />
        </div>
      </div>

      {/* Compliance Warning Banner if company settings incomplete */}
      {!companyValidation.valid && (
        <div className={styles.warningBanner}>
          <div className={styles.warningContent}>
            <AlertTriangle size={20} color="#dc2626" />
            <div>
              <h4>Incomplete Company Tax Profile</h4>
              <p>
                Invoices cannot be legally generated because required company tax details are missing:
                {' '}{companyValidation.errors?.join(', ') || 'Please verify GSTIN, PAN, and registered address.'}
              </p>
            </div>
          </div>
          <Link href="/admin/settings?tab=company" className={styles.warningBtn}>
            Complete Company &amp; Billing Settings
          </Link>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Invoiced Revenue</div>
          <div className={styles.kpiValue}>{formatINR(summary.totalInvoiced || summary.grandTotal || 0)}</div>
          <div className={styles.kpiSub}>Taxable: {formatINR(summary.taxableTotal || 0)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tax Collected (GST)</div>
          <div className={styles.kpiValue}>
            {formatINR((summary.cgstTotal || 0) + (summary.sgstTotal || 0) + (summary.igstTotal || 0))}
          </div>
          <div className={styles.kpiSub}>
            Intra: {formatINR((summary.cgstTotal || 0) + (summary.sgstTotal || 0))} · Inter (IGST): {formatINR(summary.igstTotal || 0)}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Credit Notes Issued</div>
          <div className={styles.kpiValue} style={{ color: '#b91c1c' }}>
            {formatINR(summary.creditNotesTotal || 0)}
          </div>
          <div className={styles.kpiSub}>Total refunds &amp; adjustments reversed</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Outstanding Unpaid</div>
          <div className={styles.kpiValue} style={{ color: '#b45309' }}>
            {formatINR(summary.unpaidTotal || 0)}
          </div>
          <div className={styles.kpiSub}>Awaiting COD delivery or NEFT clearance</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className={styles.tabs} aria-label="Invoice sections">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'invoices' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('invoices');
            setPage(1);
          }}
        >
          Tax Invoices
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'credit_notes' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('credit_notes');
            setPage(1);
          }}
        >
          Credit Notes
        </button>
      </nav>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterTopRow}>
          <div className={styles.searchBox}>
            <Search size={15} color="#68736a" />
            <input
              type="text"
              placeholder={activeTab === 'invoices' ? "Search invoice #, order #, buyer name, or GSTIN..." : "Search credit note #, invoice #, or order #..."}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className={styles.filterSelect}
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
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        {activeTab === 'invoices' && (
          <div className={styles.filterControlsRow}>
            <select
              className={styles.filterSelect}
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cod">COD</option>
            </select>

            <select
              className={styles.filterSelect}
              value={buyerType}
              onChange={(e) => {
                setBuyerType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Buyer: All</option>
              <option value="b2b">B2B (With GSTIN)</option>
              <option value="b2c">B2C (Retail)</option>
            </select>

            <select
              className={styles.filterSelect}
              value={stateType}
              onChange={(e) => {
                setStateType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">State: All</option>
              <option value="intra">Intra-State (CGST+SGST)</option>
              <option value="inter">Inter-State (IGST)</option>
            </select>

            <select
              className={styles.filterSelect}
              value={hasCreditNote}
              onChange={(e) => {
                setHasCreditNote(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Credit Notes: All</option>
              <option value="yes">Has Credit Note</option>
              <option value="no">No Credit Note</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#647065', position: 'relative' }}>
              <span>From:</span>
              <input
                type="date"
                lang="en-IN"
                className={`${styles.dateInput} ${dateRangeError ? styles.dateInputError : ''}`}
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  setPage(1);
                  if (toDate && val && val > toDate) {
                    setDateRangeError('From date cannot be after To date');
                  } else {
                    setDateRangeError('');
                  }
                }}
                title="Filter invoices from date (DD/MM/YYYY)"
              />
              <span>To:</span>
              <input
                type="date"
                lang="en-IN"
                className={`${styles.dateInput} ${dateRangeError ? styles.dateInputError : ''}`}
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setToDate(val);
                  setPage(1);
                  if (fromDate && val && val < fromDate) {
                    setDateRangeError('To date cannot be earlier than From date');
                  } else {
                    setDateRangeError('');
                  }
                }}
                title="Filter invoices to date (DD/MM/YYYY)"
              />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#c62828',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    padding: '0 4px'
                  }}
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setDateRangeError('');
                    setPage(1);
                  }}
                  title="Clear date filter"
                >
                  Clear
                </button>
              )}
              {dateRangeError && (
                <span
                  role="alert"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    background: '#991b1b',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: '0 2px 8px rgba(153,27,27,0.2)'
                  }}
                >
                  ⚠ {dateRangeError}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Table: Invoices */}
      {activeTab === 'invoices' && (
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
                <th style={{ textAlign: 'right' }}>GST Split (₹)</th>
                <th style={{ textAlign: 'right' }}>Total Amount (₹)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    <Skeleton height="36px" count={5} />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    <EmptyState
                      icon="file-text"
                      title="No tax invoices found"
                      description="No invoices match the selected financial year and criteria."
                      actionLabel="Reset Filters"
                      onAction={resetFilters}
                    />
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const totalGst = (inv.cgstTotal || 0) + (inv.sgstTotal || 0) + (inv.igstTotal || 0);
                  const isVoid = inv.status === 'void';
                  const hasCN = Boolean(inv.creditNoteId || (inv.creditNotes && inv.creditNotes.length > 0));

                  return (
                    <tr key={inv.id} style={{ opacity: isVoid ? 0.6 : 1 }}>
                      <td>
                        <strong>{inv.invoiceNumber}</strong>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {isVoid ? (
                            <Badge variant="danger" size="sm">VOID</Badge>
                          ) : (
                            <Badge
                              variant={inv.paymentStatus === 'paid' ? 'success' : inv.paymentStatus === 'cod' ? 'gold' : 'warning'}
                              size="sm"
                            >
                              {(inv.paymentStatus || 'unpaid').toUpperCase()}
                            </Badge>
                          )}
                          {hasCN && <Badge variant="neutral" size="sm">CN Issued</Badge>}
                        </div>
                      </td>
                      <td>
                        <strong>{formatDateDDMMYYYY(inv.invoiceDate)}</strong>
                        <div style={{ fontSize: '10px', color: '#727e74' }}>FY {inv.financialYear}</div>
                      </td>
                      <td>
                        <Link href={`/admin/orders`} style={{ color: '#1b5e20', fontWeight: 600 }}>
                          {inv.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <div><strong>{inv.buyer?.businessName || inv.buyer?.name || 'Customer'}</strong></div>
                        {inv.buyer?.isB2B && (
                          <span style={{ display: 'inline-block', fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginTop: 2 }}>
                            B2B: {inv.buyer.gstin}
                          </span>
                        )}
                        {!inv.buyer?.isB2B && (
                          <div style={{ fontSize: '10px', color: '#727e74' }}>B2C Consumer</div>
                        )}
                      </td>
                      <td>
                        {inv.placeOfSupply || 'Delhi'}
                        <div style={{ fontSize: '10px', color: '#727e74' }}>
                          Code: {inv.placeOfSupplyStateCode || '07'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatINR(inv.taxableAmount)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatINR(totalGst)}
                        <div style={{ fontSize: '10px', color: '#727e74' }}>
                          {inv.isInterState ? 'IGST' : 'CGST+SGST'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}><strong>{formatINR(inv.totalAmount)}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionGroup}>
                          <button
                            type="button"
                            className={styles.btnAction}
                            title="Preview PDF"
                            onClick={() => setPreviewPdfUrl(`/api/orders/${inv.orderId}/invoice.pdf`)}
                          >
                            <Eye size={12} /> View
                          </button>
                          <a
                            href={`/api/orders/${inv.orderId}/invoice.pdf?download=1`}
                            className={styles.btnAction}
                            title="Download PDF"
                          >
                            <Download size={12} /> Download
                          </a>
                          <button
                            type="button"
                            className={styles.btnAction}
                            title="Email to customer"
                            onClick={() => setEmailModal({
                              isOpen: true,
                              invoice: inv,
                              email: inv.buyer?.email || '',
                              isSending: false
                            })}
                          >
                            <Mail size={12} /> Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Totals Row */}
              {!loading && invoices.length > 0 && (
                <tr className={styles.totalsRow}>
                  <td colSpan={5}>ACCUMULATED SELECTION TOTALS:</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(summary.taxableTotal)}</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(summary.cgstTotal + summary.sgstTotal + summary.igstTotal)}</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(summary.totalInvoiced || summary.grandTotal)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Credit Notes Table */}
      {activeTab === 'credit_notes' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Credit Note No</th>
                <th>Issued Date</th>
                <th>Original Invoice No</th>
                <th>Order No</th>
                <th>Reason</th>
                <th style={{ textAlign: 'right' }}>Refund Amount (₹)</th>
                <th style={{ textAlign: 'right' }}>Reversed GST (₹)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    <Skeleton height="36px" count={4} />
                  </td>
                </tr>
              ) : creditNotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    <EmptyState
                      icon="rotate-ccw"
                      title="No credit notes issued"
                      description="No credit notes have been generated for this financial year or search query."
                    />
                  </td>
                </tr>
              ) : (
                creditNotes.map((cn) => {
                  const reversedTax = (cn.cgstReversed || 0) + (cn.sgstReversed || 0) + (cn.igstReversed || 0);
                  return (
                    <tr key={cn.id}>
                      <td>
                        <strong>{cn.creditNoteNumber}</strong>
                        <div style={{ fontSize: '10px', color: '#727e74' }}>FY {cn.financialYear}</div>
                      </td>
                      <td><strong>{formatDateDDMMYYYY(cn.issuedAt || cn.createdAt)}</strong></td>
                      <td><strong>{cn.invoiceNumber}</strong></td>
                      <td>
                        <Link href="/admin/orders" style={{ color: '#1b5e20', fontWeight: 600 }}>
                          {cn.orderNumber}
                        </Link>
                      </td>
                      <td>{cn.reason || 'Customer Return'}</td>
                      <td style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 700 }}>
                        -{formatINR(cn.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        -{formatINR(reversedTax)}
                        <div style={{ fontSize: '10px', color: '#727e74' }}>
                          {cn.igstReversed > 0 ? 'IGST' : 'CGST+SGST'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <a
                          href={`/api/orders/${cn.orderId}/invoice.pdf?type=credit_note&download=1`}
                          className={styles.btnAction}
                          title="Download Credit Note PDF"
                        >
                          <Download size={12} /> Download PDF
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

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
        itemLabel={activeTab === 'invoices' ? 'invoices' : 'credit notes'}
      />

      {/* MODAL: PDF Preview */}
      <Modal
        isOpen={Boolean(previewPdfUrl)}
        onClose={() => setPreviewPdfUrl(null)}
        title="Tax Invoice PDF Preview"
        maxWidth="900px"
      >
        {previewPdfUrl && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 12 }}>
              <a
                href={`${previewPdfUrl}?download=1`}
                className={styles.btnAction}
                download
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
            <iframe
              src={previewPdfUrl}
              className={styles.pdfPreviewFrame}
              title="Invoice PDF Viewer"
            />
          </div>
        )}
      </Modal>

      {/* MODAL: Email to Customer */}
      <Modal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ isOpen: false, invoice: null, email: '', isSending: false })}
        title="Email Invoice PDF to Customer"
        maxWidth="500px"
      >
        <div className={styles.modalField}>
          <label>Recipient Email Address</label>
          <input
            type="email"
            className={styles.modalInput}
            value={emailModal.email}
            onChange={(e) => setEmailModal((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="customer@example.com"
          />
        </div>
        <p style={{ fontSize: 12, color: '#647065' }}>
          This will attach the official GST Tax Invoice PDF for {emailModal.invoice?.invoiceNumber} (Rs. {emailModal.invoice?.totalAmount}) directly to the email.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalBtnSecondary}
            onClick={() => setEmailModal({ isOpen: false, invoice: null, email: '', isSending: false })}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalBtnPrimary}
            disabled={emailModal.isSending || !emailModal.email.trim()}
            onClick={handleSendEmail}
          >
            {emailModal.isSending ? 'Sending PDF...' : 'Send Invoice Email'}
          </button>
        </div>
      </Modal>

      {/* MODAL: Issue Credit Note */}
      <Modal
        isOpen={creditNoteModal.isOpen}
        onClose={() => setCreditNoteModal({ isOpen: false, invoice: null, amount: '', reason: '', isSubmitting: false })}
        title="Issue GST Credit Note"
        maxWidth="520px"
      >
        <p style={{ fontSize: 13, color: '#2a342d', marginBottom: 14 }}>
          Issuing a credit note reverses the taxable amount and GST collected for Invoice <strong>{creditNoteModal.invoice?.invoiceNumber}</strong>.
        </p>
        <div className={styles.modalField}>
          <label>Refund Amount (₹) (Max: {creditNoteModal.invoice?.totalAmount})</label>
          <input
            type="number"
            step="0.01"
            max={creditNoteModal.invoice?.totalAmount}
            className={styles.modalInput}
            value={creditNoteModal.amount}
            onChange={(e) => setCreditNoteModal((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Enter refund amount"
          />
        </div>
        <div className={styles.modalField}>
          <label>Reason for Credit Note</label>
          <input
            type="text"
            className={styles.modalInput}
            value={creditNoteModal.reason}
            onChange={(e) => setCreditNoteModal((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="e.g. Return of damaged item, price correction, goodwill refund"
          />
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalBtnSecondary}
            onClick={() => setCreditNoteModal({ isOpen: false, invoice: null, amount: '', reason: '', isSubmitting: false })}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalBtnPrimary}
            disabled={creditNoteModal.isSubmitting || !creditNoteModal.amount}
            onClick={handleIssueCreditNote}
          >
            {creditNoteModal.isSubmitting ? 'Issuing...' : 'Issue Credit Note'}
          </button>
        </div>
      </Modal>

      {/* CONFIRM DIALOG: Void Invoice */}
      <ConfirmDialog
        isOpen={voidConfirm.isOpen}
        onClose={() => setVoidConfirm({ isOpen: false, invoice: null, reason: '' })}
        onConfirm={handleVoidInvoice}
        title={`Void Invoice ${voidConfirm.invoice?.invoiceNumber}?`}
        message="Voiding an invoice marks it invalid in compliance logs without deleting the sequential number. An audit entry will be recorded."
        confirmLabel="Void Invoice"
        tone="danger"
      />
    </div>
  );
}
