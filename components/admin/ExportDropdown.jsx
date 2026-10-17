'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, FileCode, Printer } from 'lucide-react';
import { exportToCsv, exportToExcel, exportToWord, exportToPdf } from '@/lib/export-utils';
import styles from './ExportDropdown.module.css';

export default function ExportDropdown({
  filename = 'export',
  title = 'Data Export',
  columns = [],
  data = [],
  disabled = false,
  label = 'Export',
  apiEndpoint = null,
  queryParams = '',
  selectedCount = 0
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [scope, setScope] = useState('filtered'); // 'filtered' | 'selected' | 'all'
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleExport = async (format) => {
    setOpen(false);

    if (apiEndpoint && (format === 'xlsx' || format === 'csv')) {
      try {
        setDownloading(true);
        // Build export query params
        const params = new URLSearchParams(typeof queryParams === 'string' ? queryParams : '');
        params.set('format', format);
        params.set('scope', scope);
        if (columns && columns.length > 0) {
          params.set('columns', columns.map((c) => c.key || c.id).filter(Boolean).join(','));
        }

        const url = `${apiEndpoint}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Server export failed');
        }

        const blob = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      } catch (err) {
        alert(`Export failed: ${err.message}`);
      } finally {
        setDownloading(false);
      }
      return;
    }

    if (!data.length) {
      alert('No data records available to export.');
      return;
    }

    const payload = { filename, title, columns, data };
    switch (format) {
      case 'csv':
        exportToCsv(payload);
        break;
      case 'excel':
      case 'xlsx':
        exportToExcel(payload);
        break;
      case 'word':
        exportToWord(payload);
        break;
      case 'pdf':
        exportToPdf(payload);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled || (!data.length && !apiEndpoint) || downloading}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Download size={14} />
        <span>{downloading ? 'Exporting...' : label}</span>
        <ChevronDown size={13} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {apiEndpoint && (
            <div style={{ padding: '6px 8px 8px', borderBottom: '1px solid #ebe6dd', marginBottom: '4px', fontSize: '11px' }}>
              <div style={{ fontWeight: 700, color: '#1b2e23', marginBottom: '4px' }}>Export Scope</div>
              <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportScope"
                    value="filtered"
                    checked={scope === 'filtered'}
                    onChange={() => setScope('filtered')}
                  />
                  <span>All Filtered Records</span>
                </label>
                {selectedCount > 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportScope"
                      value="selected"
                      checked={scope === 'selected'}
                      onChange={() => setScope('selected')}
                    />
                    <span>Selected ({selectedCount})</span>
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportScope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                  />
                  <span>Entire Catalogue</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.option}
            onClick={() => handleExport(apiEndpoint ? 'xlsx' : 'excel')}
            role="menuitem"
          >
            <FileSpreadsheet size={14} color="#1b7340" />
            <span>Excel Spreadsheet</span>
            <span className={styles.badge}>.xlsx</span>
          </button>

          <button
            type="button"
            className={styles.option}
            onClick={() => handleExport('csv')}
            role="menuitem"
          >
            <FileCode size={14} color="#2e7d32" />
            <span>CSV File</span>
            <span className={styles.badge}>.csv</span>
          </button>

          <button
            type="button"
            className={styles.option}
            onClick={() => handleExport('word')}
            role="menuitem"
          >
            <FileText size={14} color="#185abd" />
            <span>Word Document</span>
            <span className={styles.badge}>.doc</span>
          </button>

          <button
            type="button"
            className={styles.option}
            onClick={() => handleExport('pdf')}
            role="menuitem"
          >
            <Printer size={14} color="#d32f2f" />
            <span>PDF Print / Save</span>
            <span className={styles.badge}>.pdf</span>
          </button>
        </div>
      )}
    </div>
  );
}
