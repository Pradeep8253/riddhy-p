"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./AdminPagination.module.css";

export default function AdminPagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  if (totalItems <= pageSize && totalPages === 1 && !onPageSizeChange) {
    return null;
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.summary}>
        <span>
          Showing <b>{start}</b>–<b>{end}</b> of <b>{totalItems}</b> records
        </span>

        {onPageSizeChange && (
          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span>Per page:</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              type="button"
              key={page}
              className={`${styles.btn} ${currentPage === page ? styles.active : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          className={styles.btn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
