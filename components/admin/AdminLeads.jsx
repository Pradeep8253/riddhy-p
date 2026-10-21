'use client';

import { useEffect, useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import ExportDropdown from './ExportDropdown';
import AdminPagination from './AdminPagination';
import styles from './AdminLeads.module.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No show' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'spam', label: 'Spam' }
];

export default function AdminLeads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kindFilter, setKindFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notice, setNotice] = useState('');
  const [activeLead, setActiveLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [assignee, setAssignee] = useState('');
  const [scheduledAtInput, setScheduledAtInput] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [kindFilter, statusFilter, serviceFilter, searchQuery, dateFrom, dateTo]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const exportColumns = [
    { label: 'Reference', key: (item) => item.reference || '—' },
    { label: 'Type', key: (item) => item.kind || '—' },
    { label: 'Customer Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: (item) => item.email || '—' },
    { label: 'Pincode', key: (item) => item.pincode || '—' },
    { label: 'Serviceable', key: (item) => (item.serviceable === false ? 'No' : 'Yes') },
    { label: 'Status', key: 'status' },
    { label: 'Date', key: (item) => new Date(item.createdAt).toLocaleString('en-IN') },
    { label: 'Message / Notes', key: (item) => item.message || item.specifications || '' }
  ];

  const loadLeads = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (kindFilter !== 'all') params.set('kind', kindFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (serviceFilter !== 'all') params.set('serviceable', serviceFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);

    fetch(`/api/admin/leads?${params.toString()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setItems(json.data || []);
        } else {
          setNotice(json.error?.message || 'Could not load enquiries.');
        }
      })
      .catch(() => setNotice('Could not load enquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, [kindFilter, statusFilter, serviceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (kindFilter !== 'all') params.set('kind', kindFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (serviceFilter !== 'all') params.set('serviceable', serviceFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    params.set('format', 'csv');

    window.open(`/api/admin/leads?${params.toString()}`, '_blank');
  };

  const updateLeadStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setNotice(json.error?.message || 'Could not update status.');
        return;
      }
      setNotice('Enquiry status updated.');
      if (activeLead && activeLead.id === id) {
        setActiveLead((prev) => ({ ...prev, status }));
      }
      loadLeads();
    } catch {
      setNotice('Could not update status.');
    }
  };

  const saveLeadDetails = async () => {
    if (!activeLead) return;
    try {
      const payload = {
        id: activeLead.id,
        assignedTo: assignee.trim(),
        scheduledAt: scheduledAtInput ? new Date(scheduledAtInput).toISOString() : undefined,
        note: newNote.trim() || undefined
      };

      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setNotice(json.error?.message || 'Could not save lead details.');
        return;
      }

      setNotice('Lead details saved.');
      setNewNote('');
      if (json.data?.internalNotes) {
        setActiveLead((prev) => ({
          ...prev,
          internalNotes: json.data.internalNotes,
          assignedTo: json.data.assignedTo,
          scheduledAt: json.data.scheduledAt
        }));
      }
      loadLeads();
    } catch {
      setNotice('Could not save lead details.');
    }
  };

  const openDrawer = (lead) => {
    setActiveLead(lead);
    setAssignee(lead.assignedTo || '');
    setScheduledAtInput(
      lead.scheduledAt ? new Date(lead.scheduledAt).toISOString().slice(0, 16) : ''
    );
    setNewNote('');
  };

  // KPI counters
  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const newToday = items.filter(
      (item) => item.kind === 'consultation' && String(item.createdAt).slice(0, 10) === today
    ).length;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const awaitingOver24h = items.filter(
      (item) => item.status === 'new' && new Date(item.createdAt).getTime() < oneDayAgo
    ).length;

    return { newToday, awaitingOver24h, total: items.length };
  }, [items]);

  return (
    <section className={styles.page}>
      {/* Header & KPI Summary */}
      <div className={styles.heading}>
        <div>
          <span className="kicker">RF Riddhy · Customer Care & Consultation Triage</span>
          <h1>Enquiry Inbox</h1>
          <p>Manage home consultations, customer care messages, and bulk trade requests.</p>
        </div>

        <div className={styles.headerActions}>
          <ExportDropdown
            title="Export Enquiries"
            fileName="rf-riddhy-enquiries"
            columns={exportColumns}
            data={items}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span>New Consultations Today</span>
          <b>{kpis.newToday}</b>
        </div>
        <div className={styles.kpiCard}>
          <span>Awaiting Response &gt; 24h</span>
          <b style={{ color: kpis.awaitingOver24h > 0 ? '#b3261e' : 'inherit' }}>
            {kpis.awaitingOver24h}
          </b>
        </div>
        <div className={styles.kpiCard}>
          <span>Total In Current View</span>
          <b>{kpis.total}</b>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={styles.filterBar}>
        <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
          <Icon name="search" size={16} />
          <input
            type="text"
            placeholder="Search name, phone, or reference (RC-…)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Filter</button>
        </form>

        <div className={styles.selectFilters}>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="on_demand">On-Demand Orders</option>
            <option value="bulk">Bulk Inquiries</option>
            <option value="consultation">Consultations</option>
            <option value="contact">Customer care</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            aria-label="Filter by serviceability"
          >
            <option value="all">Serviceability: All</option>
            <option value="true">Serviceable</option>
            <option value="false">Non-Serviceable</option>
          </select>
        </div>
      </div>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {/* Leads List */}
      {loading ? (
        <div className={styles.empty}>Loading enquiries…</div>
      ) : items.length > 0 ? (
        <div className={styles.list}>
          {paginatedItems.map((item) => (
            <article
              key={item.id}
              className={`${styles.card} ${activeLead?.id === item.id ? styles.cardSelected : ''}`}
              onClick={() => openDrawer(item)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.badgeRow}>
                  <span className={`${styles.kind} ${styles['kind_' + item.kind]}`}>
                    {item.kind === 'on_demand'
                      ? 'On-Demand Order'
                      : item.kind === 'bulk'
                      ? 'Bulk Inquiry'
                      : item.kind === 'consultation'
                      ? 'Consultation'
                      : item.kind === 'trade'
                      ? 'Trade / Bulk'
                      : 'Customer Care'}
                  </span>

                  {item.reference && (
                    <span className={styles.refCode}>
                      {item.reference}
                    </span>
                  )}

                  {item.serviceable === false && (
                    <span className={styles.unserviceablePill}>
                      Outside demo delivery
                    </span>
                  )}
                </div>

                <time className={styles.dateLabel}>
                  {new Date(item.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </time>
              </div>

              <div className={styles.cardBody}>
                <h2>
                  {item.name}
                  {item.company ? ` · ${item.company}` : ''}
                </h2>

                <div className={styles.contactLine}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Icon name="phone" size={13} /> {item.phone}
                  </span>
                  {item.email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="mail" size={13} /> {item.email}
                    </span>
                  )}
                  {item.pincode && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="pin" size={13} /> {item.pincode}
                    </span>
                  )}
                </div>

                {item.kind === 'consultation' && (
                  <div className={styles.consultationMeta}>
                    <b>Slot:</b> {item.preferredDate ? new Date(item.preferredDate).toLocaleDateString('en-IN') : '—'} ({item.timeWindow})
                    {item.mode && ` · Mode: ${item.mode.toUpperCase()}`}
                    {item.roomType && ` · Room: ${item.roomType}`}
                  </div>
                )}

                {item.topic && (
                  <div className={styles.topicMeta}>
                    <b>Topic:</b> {item.topic.toUpperCase()}
                    {item.orderNumber ? ` · Order #${item.orderNumber}` : ''}
                  </div>
                )}

                <p className={styles.messageSnippet}>
                  {item.message || (item.kind === 'consultation' ? 'No additional notes provided.' : '')}
                </p>
              </div>

              <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
                <small className={styles.emailStatus}>
                  {item.emailSent ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="check" size={12} /> Email notified
                    </span>
                  ) : (
                    'Email not sent'
                  )}
                  {item.internalNotes?.length ? ` · ${item.internalNotes.length} notes` : ''}
                </small>

                <div className={styles.statusAction}>
                  <label htmlFor={`status_${item.id}`} className="sr-only">
                    Change status
                  </label>
                  <select
                    id={`status_${item.id}`}
                    value={item.status}
                    onChange={(e) => updateLeadStatus(item.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No show</option>
                    <option value="resolved">Resolved</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No enquiries found matching this filter.</div>
      )}

      {items.length > 0 && (
        <AdminPagination
          currentPage={page}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="enquiries"
        />
      )}

      {/* Slide-over Detail Drawer */}
      {activeLead && (
        <aside className={styles.drawerOverlay} onClick={() => setActiveLead(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <span className="kicker">Lead Details</span>
                <h2>{activeLead.name}</h2>
                {activeLead.reference && <code>{activeLead.reference}</code>}
              </div>
              <button
                type="button"
                className={styles.closeDrawerBtn}
                onClick={() => setActiveLead(null)}
                aria-label="Close details"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Status & Quick info */}
              <div className={styles.drawerSection}>
                <h4>Lead Status</h4>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    value={activeLead.status}
                    onChange={(e) => updateLeadStatus(activeLead.id, e.target.value)}
                    className={styles.drawerSelect}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No show</option>
                    <option value="resolved">Resolved</option>
                    <option value="spam">Spam</option>
                  </select>

                  <span className={`${styles.kind} ${styles['kind_' + activeLead.kind]}`}>
                    {activeLead.kind.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Contact information */}
              <div className={styles.drawerSection}>
                <h4>Contact Details</h4>
                <dl className={styles.detailGrid}>
                  <div>
                    <dt>Phone:</dt>
                    <dd><a href={`tel:${activeLead.phone}`}>{activeLead.phone}</a></dd>
                  </div>
                  <div>
                    <dt>Email:</dt>
                    <dd>{activeLead.email ? <a href={`mailto:${activeLead.email}`}>{activeLead.email}</a> : 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Pincode:</dt>
                    <dd>{activeLead.pincode || '—'} {activeLead.serviceable ? '(Serviceable)' : '(Outside Direct Area)'}</dd>
                  </div>
                  <div>
                    <dt>Submitted:</dt>
                    <dd>{new Date(activeLead.createdAt).toLocaleString('en-IN')}</dd>
                  </div>
                </dl>
              </div>

              {/* Consultation specifics */}
              {activeLead.kind === 'consultation' && (
                <div className={styles.drawerSection}>
                  <h4>Consultation Plan</h4>
                  <dl className={styles.detailGrid}>
                    <div>
                      <dt>Mode:</dt>
                      <dd><b>{activeLead.mode?.toUpperCase() || 'PHONE'}</b></dd>
                    </div>
                    <div>
                      <dt>Preferred Slot:</dt>
                      <dd>{activeLead.preferredDate ? new Date(activeLead.preferredDate).toLocaleDateString('en-IN') : '—'} ({activeLead.timeWindow})</dd>
                    </div>
                    {activeLead.altDate && (
                      <div>
                        <dt>Alt Slot:</dt>
                        <dd>{new Date(activeLead.altDate).toLocaleDateString('en-IN')} ({activeLead.altTimeWindow || '—'})</dd>
                      </div>
                    )}
                    <div>
                      <dt>Interests:</dt>
                      <dd>{(activeLead.interest || []).join(', ') || '—'}</dd>
                    </div>
                    <div>
                      <dt>Room Type:</dt>
                      <dd>{activeLead.roomType || '—'}</dd>
                    </div>
                    <div>
                      <dt>Budget:</dt>
                      <dd>{activeLead.budgetRange || '—'}</dd>
                    </div>
                    <div>
                      <dt>Language:</dt>
                      <dd>{activeLead.language === 'hi' ? 'Hindi' : 'English'}</dd>
                    </div>
                    <div>
                      <dt>WhatsApp Opt-In:</dt>
                      <dd>{activeLead.whatsappOptIn ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* On-Demand & Bulk order specifics */}
              {(activeLead.kind === 'on_demand' || activeLead.kind === 'bulk' || activeLead.productName) && (
                <div className={styles.drawerSection}>
                  <h4>Product & Order Requirements</h4>
                  <dl className={styles.detailGrid}>
                    {activeLead.productName && (
                      <div>
                        <dt>Product / Concept:</dt>
                        <dd><b>{activeLead.productName}</b></dd>
                      </div>
                    )}
                    {activeLead.category && (
                      <div>
                        <dt>Category:</dt>
                        <dd>{activeLead.category}</dd>
                      </div>
                    )}
                    {activeLead.quantity && (
                      <div>
                        <dt>Quantity:</dt>
                        <dd><b>{activeLead.quantity} units</b></dd>
                      </div>
                    )}
                    {activeLead.budgetRange && (
                      <div>
                        <dt>Budget Target:</dt>
                        <dd>{activeLead.budgetRange}</dd>
                      </div>
                    )}
                    {activeLead.deliveryLocation && (
                      <div>
                        <dt>Delivery Location:</dt>
                        <dd>{activeLead.deliveryLocation}</dd>
                      </div>
                    )}
                    {activeLead.preferredDate && (
                      <div>
                        <dt>Preferred Date:</dt>
                        <dd>{new Date(activeLead.preferredDate).toLocaleDateString('en-IN')}</dd>
                      </div>
                    )}
                    {activeLead.preferredContactMethod && (
                      <div>
                        <dt>Contact Via:</dt>
                        <dd>{activeLead.preferredContactMethod.toUpperCase()}</dd>
                      </div>
                    )}
                  </dl>

                  {activeLead.specifications && (
                    <div style={{ marginTop: '12px' }}>
                      <dt style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rf-forest-deep)' }}>Specifications:</dt>
                      <dd style={{ fontSize: '12px', background: 'var(--rf-cream-100)', padding: '8px 12px', borderRadius: '6px', margin: '4px 0 0' }}>
                        {activeLead.specifications}
                      </dd>
                    </div>
                  )}

                  {activeLead.referenceImage && (
                    <div style={{ marginTop: '14px' }}>
                      <dt style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rf-forest-deep)', marginBottom: '6px' }}>Uploaded Reference Image:</dt>
                      <dd style={{ margin: 0 }}>
                        <a href={activeLead.referenceImage} target="_blank" rel="noopener noreferrer">
                          <img
                            src={activeLead.referenceImage}
                            alt="Customer sample reference"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '220px',
                              borderRadius: '8px',
                              border: '1px solid var(--rf-line)',
                              objectFit: 'contain'
                            }}
                          />
                        </a>
                        <small style={{ display: 'block', color: '#6a766c', marginTop: '4px' }}>Click image to open in full size</small>
                      </dd>
                    </div>
                  )}
                </div>
              )}

              {/* Customer message */}
              <div className={styles.drawerSection}>
                <h4>Message / Notes</h4>
                <div className={styles.notesBox}>
                  {activeLead.message || 'No additional text provided.'}
                </div>
              </div>

              {/* Staff Assignment & Schedule Date */}
              <div className={styles.drawerSection}>
                <h4>Assignment & Follow-up</h4>
                <div className={styles.assignRow}>
                  <div>
                    <label>Assigned Staff (Email):</label>
                    <input
                      type="text"
                      placeholder="e.g. advisor@riddhy.in"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Scheduled Session At:</label>
                    <input
                      type="datetime-local"
                      value={scheduledAtInput}
                      onChange={(e) => setScheduledAtInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Internal Notes History */}
              <div className={styles.drawerSection}>
                <h4>Internal Notes ({activeLead.internalNotes?.length || 0})</h4>
                <div className={styles.notesList}>
                  {activeLead.internalNotes && activeLead.internalNotes.length > 0 ? (
                    activeLead.internalNotes.map((note, idx) => (
                      <div key={idx} className={styles.internalNoteItem}>
                        <div className={styles.noteMeta}>
                          <b>{note.byName || 'Staff'}</b>
                          <small>{new Date(note.at).toLocaleString('en-IN')}</small>
                        </div>
                        <p>{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <small style={{ color: 'var(--rf-charcoal-600)' }}>No internal notes recorded yet.</small>
                  )}
                </div>

                <div className={styles.addNoteBox}>
                  <textarea
                    rows={2}
                    placeholder="Add an internal note about this consultation..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="button" onClick={saveLeadDetails} className={styles.saveDetailsBtn}>
                    Save Changes & Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
}
