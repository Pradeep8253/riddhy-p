'use client';

import { useState } from 'react';
import {
  X,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import styles from './AdminImportModal.module.css';

export default function AdminImportModal({ isOpen, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError('');
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append('file', selected);

      // Perform dry-run preview validation
      const res = await fetch('/api/admin/products/import?dryRun=true', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to parse file preview.');
      }

      setPreview(data.data);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    setBusy(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/products/import?dryRun=false', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Import execution failed.');
      }

      onImportComplete?.(data.data?.importedCount || 0);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h3>Import Catalogue Products</h3>
            <p className={styles.subtitle}>Upload Excel (.xlsx) or CSV spreadsheet to bulk create or update by SKU.</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {error && (
            <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Download Sample Template */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#334155' }}>
              <FileSpreadsheet size={18} color="#1f5f2e" />
              <span>Use standard template with pre-formatted column headers</span>
            </div>
            <a
              href="/api/admin/products/import"
              download="products-template.xlsx"
              className={styles.btnSecondary}
              style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <Download size={14} /> Download Sample Template
            </a>
          </div>

          {/* Upload Dropzone */}
          {!preview && (
            <label className={styles.dropzone}>
              {busy ? (
                <>
                  <Loader2 size={32} className="animate-spin" color="#1f5f2e" />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Parsing spreadsheet and validating rows...</span>
                </>
              ) : (
                <>
                  <Upload size={32} color="#1f5f2e" />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Choose Excel (.xlsx) or CSV file</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dry-run validation checks SKUs, prices, and categories before saving.</span>
                </>
              )}
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileSelect}
                disabled={busy}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {/* Dry Run Preview */}
          {preview && (
            <>
              <div className={styles.summaryBar}>
                <span>Total Rows: {preview.summary?.totalRows || 0}</span>
                <span className={styles.statValid}>✓ Valid: {preview.summary?.validCount || 0}</span>
                <span className={styles.statWarning}>⚠ Warnings: {preview.summary?.warningCount || 0}</span>
                <span className={styles.statError}>✕ Errors: {preview.summary?.errorCount || 0}</span>
              </div>

              <div className={styles.previewTableWrap}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Row</th>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Validation Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows?.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={
                          row.statusTag === 'valid'
                            ? styles.rowValid
                            : row.statusTag === 'warning'
                            ? styles.rowWarning
                            : styles.rowError
                        }
                      >
                        <td>#{row.rowNumber}</td>
                        <td><b>{row.sku || '—'}</b></td>
                        <td>{row.name || '—'}</td>
                        <td>{row.category || '—'}</td>
                        <td>₹{row.price || 0}</td>
                        <td>
                          <span
                            className={
                              row.statusTag === 'valid'
                                ? styles.badgeValid
                                : row.statusTag === 'warning'
                                ? styles.badgeWarning
                                : styles.badgeError
                            }
                          >
                            {row.statusTag}
                          </span>
                        </td>
                        <td>
                          {row.errors?.length > 0 ? (
                            <span style={{ color: '#b91c1c' }}>{row.errors.join(', ')}</span>
                          ) : row.warnings?.length > 0 ? (
                            <span style={{ color: '#b45309' }}>{row.warnings.join(', ')}</span>
                          ) : (
                            <span style={{ color: '#166534' }}>Ready for import</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <div>
            {preview && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
              >
                Choose Different File
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={busy}>
              Cancel
            </button>
            {preview && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleConfirmImport}
                disabled={busy || (preview.summary?.validCount === 0 && preview.summary?.warningCount === 0)}
              >
                {busy && <Loader2 size={15} className="animate-spin" style={{ marginRight: 6, display: 'inline' }} />}
                Confirm &amp; Import {(preview.summary?.validCount || 0) + (preview.summary?.warningCount || 0)} Products
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
