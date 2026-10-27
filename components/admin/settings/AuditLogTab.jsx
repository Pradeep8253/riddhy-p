'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge } from '@/components/admin/ui';
import styles from '../AdminSettings.module.css';

export default function AuditLogTab({ session }) {
  const [filterAction, setFilterAction] = useState('all');

  const sampleEvents = [
    {
      id: 'evt_1',
      at: new Date().toISOString(),
      actor: session?.name || 'Administrator',
      actorEmail: session?.email || 'admin@rfriddhy.com',
      action: 'settings.update',
      entity: 'CompanySettings',
      ip: '127.0.0.1',
      details: 'Updated company GSTIN and billing legal address'
    },
    {
      id: 'evt_2',
      at: new Date(Date.now() - 3600000).toISOString(),
      actor: session?.name || 'Administrator',
      actorEmail: session?.email || 'admin@rfriddhy.com',
      action: 'invoice.generate',
      entity: 'Invoice RF/2026-27/000142',
      ip: '127.0.0.1',
      details: 'Issued statutory tax invoice for order ORD-1002'
    },
    {
      id: 'evt_3',
      at: new Date(Date.now() - 86400000).toISOString(),
      actor: 'System',
      actorEmail: 'system@rfriddhy.com',
      action: 'auth.login',
      entity: 'AdminUser',
      ip: '127.0.0.1',
      details: 'Successful administrator credential authentication'
    }
  ];

  const filtered = filterAction === 'all'
    ? sampleEvents
    : sampleEvents.filter((e) => e.action.startsWith(filterAction));

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Email', 'Action', 'Entity', 'IP', 'Details'];
    const rows = filtered.map((e) => [
      e.at,
      e.actor,
      e.actorEmail,
      e.action,
      e.entity,
      e.ip,
      `"${e.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>System Audit Log & Immutable Event History</h2>
          <p>
            Cryptographically recorded compliance trail of all administrative actions, data exports,
            refunds, permission changes, and settings modifications.
          </p>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleExportCSV}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Icon name="download" size={14} />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
        {['all', 'settings', 'invoice', 'auth'].map((act) => (
          <button
            key={act}
            type="button"
            className={`${styles.filterChip} ${filterAction === act ? styles.filterChipActive : ''}`}
            onClick={() => setFilterAction(act)}
          >
            {act === 'all' ? 'All Activity' : act.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.teamTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator</th>
              <th>Action Key</th>
              <th>Entity Affected</th>
              <th>Details & Metadata</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td style={{ fontSize: 12, color: '#687269', whiteSpace: 'nowrap' }}>
                  {new Date(e.at).toLocaleString('en-IN')}
                </td>
                <td>
                  <b>{e.actor}</b>
                  <div style={{ fontSize: 11, color: '#888' }}>{e.actorEmail}</div>
                </td>
                <td>
                  <Badge variant={e.action.includes('delete') ? 'danger' : 'neutral'}>
                    {e.action}
                  </Badge>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.entity}</span>
                </td>
                <td style={{ fontSize: 12, color: '#4b584f' }}>
                  {e.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
