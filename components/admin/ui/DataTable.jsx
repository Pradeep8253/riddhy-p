'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './DataTable.module.css';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  searchPlaceholder = 'Search records...',
  initialSortField = '',
  initialSortDirection = 'asc',
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  exportFilename = 'export.csv',
  emptyMessage = 'No records found matching your filters.'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [visibleColumns, setVisibleColumns] = useState(
    () => new Set(columns.map((c) => c.key))
  );
  const [showColDropdown, setShowColDropdown] = useState(false);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const res = valA > valB ? 1 : -1;
      return sortDirection === 'asc' ? res : -res;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const handleToggleCol = (key) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    const activeCols = columns.filter((c) => visibleColumns.has(c.key));
    const headers = activeCols.map((c) => `"${c.label}"`).join(',');
    const rows = sortedData.map((row) =>
      activeCols
        .map((c) => {
          const val = row[c.key] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.tableCard}>
      {/* Table Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Icon name="search" size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>

        <div className={styles.tools}>
          {/* Column Visibility */}
          <div className={styles.colPickerWrapper}>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => setShowColDropdown((prev) => !prev)}
            >
              <Icon name="menu" size={14} />
              <span>Columns</span>
            </button>

            {showColDropdown && (
              <div className={styles.colDropdown}>
                {columns.map((col) => (
                  <label key={col.key} className={styles.colOption}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col.key)}
                      onChange={() => handleToggleCol(col.key)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleExportCSV}
            title="Download CSV export"
          >
            <Icon name="download" size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns
                .filter((c) => visibleColumns.has(c.key))
                .map((col) => (
                  <th
                    key={col.key}
                    className={col.sortable !== false ? styles.sortableTh : ''}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className={styles.thContent}>
                      <span>{col.label}</span>
                      {col.sortable !== false && sortField === col.key && (
                        <span className={styles.sortArrow}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={row[keyField] || idx}>
                  {columns
                    .filter((c) => visibleColumns.has(c.key))
                    .map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.emptyTd}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
        </div>

        <div className={styles.pageActions}>
          <div className={styles.pageSizeSelect}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.pageNav}>
            <button
              type="button"
              className={styles.pageNavBtn}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <Icon name="arrow-left" size={14} />
            </button>
            <span className={styles.pageIndicator}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageNavBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
