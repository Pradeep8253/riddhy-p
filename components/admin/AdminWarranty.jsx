"use client";

import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { CheckCircle, Clock, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminPagination from "./AdminPagination";
import styles from "./AdminWarranty.module.css";
import ExportDropdown from "./ExportDropdown";

export default function AdminWarranty() {
  const [activeTab, setActiveTab] = useState("registrations"); // 'registrations' | 'review_queue' | 'claims'
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/admin/warranty?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error?.message || "Failed to load warranty records",
        );
      }

      if (activeTab === "claims") {
        setItems(data.data?.claims || []);
      } else {
        setItems(data.data?.registrations || []);
      }
      setTotal(data.data?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load warranty records");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, search, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const handleReviewAction = async (id, action) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/warranty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      fetchRecords();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeClass = (status) => {
    if (status === "active") return styles.statusActive;
    if (status === "expiring_soon") return styles.statusExpiring;
    return styles.statusExpired;
  };

  const exportColumns = [
    { label: "Customer Name", key: "customerName" },
    { label: "Customer Phone", key: "customerPhone" },
    { label: "Product Name", key: "productName" },
    { label: "SKU", key: "sku" },
    { label: "Serial Number", key: "serialNumber" },
    { label: "Order Ref", key: "orderNumber" },
    {
      label: "Purchase Date",
      key: "purchaseDate",
      getValue: (r) => formatDateDDMMYYYY(r.purchaseDate),
    },
    {
      label: "Expiry Date",
      key: "expiryDate",
      getValue: (r) => formatDateDDMMYYYY(r.expiryDate),
    },
    { label: "Remaining Days", key: "remainingDays" },
    { label: "Warranty Status", key: "currentStatus" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1>Warranty Care &amp; Review Desk</h1>
          <p>
            Automated purchase registrations, offline proof verification queue,
            and service claim management.
          </p>
        </div>

        <div className={styles.controls}>
          <ExportDropdown
            title="Warranty Export"
            filename={`warranty-export-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={items}
            apiEndpoint="/api/admin/warranty/export"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <button
          type="button"
          onClick={() => {
            setActiveTab("registrations");
            setPage(1);
          }}
          className={`${styles.tabBtn} ${activeTab === "registrations" ? styles.tabBtnActive : ""}`}
        >
          All Registrations
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("review_queue");
            setPage(1);
          }}
          className={`${styles.tabBtn} ${activeTab === "review_queue" ? styles.tabBtnActive : ""}`}
        >
          Offline Review Queue
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("claims");
            setPage(1);
          }}
          className={`${styles.tabBtn} ${activeTab === "claims" ? styles.tabBtnActive : ""}`}
        >
          Claims Desk
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={14} color="#727e74" />
          <input
            type="text"
            placeholder="Search customer, phone, serial, order, SKU..."
            className={styles.searchInnerInput}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {activeTab !== "review_queue" && (
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expiring_soon">Expiring Soon (≤30d)</option>
            <option value="expired">Expired</option>
          </select>
        )}
      </div>

      {error && (
        <div
          style={{
            color: "#c62828",
            background: "#ffebee",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading warranty records...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === "review_queue"
              ? "Review queue is clear! All customer registrations have been verified."
              : "No warranty records found matching criteria."}
          </div>
        ) : activeTab === "claims" ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Claim No</th>
                <th>Date</th>
                <th>Issue Description</th>
                <th>Preferred Contact</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.claimNumber || c.id.slice(-8)}</strong>
                  </td>
                  <td>{formatDateDDMMYYYY(c.createdAt)}</td>
                  <td>{c.issue}</td>
                  <td>{c.preferredContact || "Phone"}</td>
                  <td>{c.assignedToEmail || "Unassigned"}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ background: "#eaf5ec", color: "#17632a" }}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer &amp; Phone</th>
                <th>Product &amp; SKU</th>
                <th>Order Ref</th>
                <th>Purchase &amp; Expiry</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Verification</th>
                {activeTab === "review_queue" && <th>Review Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b
                      style={{
                        color: "var(--rf-forest-deep)",
                        display: "block",
                      }}
                    >
                      {r.customerName}
                    </b>
                    <span style={{ color: "#7b857d" }}>{r.customerPhone}</span>
                  </td>
                  <td>
                    <b style={{ display: "block" }}>{r.productName || r.sku}</b>
                    <span style={{ color: "#7b857d", fontSize: "11px" }}>
                      SKU: {r.sku}{" "}
                      {r.serialNumber ? `· S/N: ${r.serialNumber}` : ""}
                    </span>
                  </td>
                  <td>{r.orderNumber || "Offline"}</td>
                  <td>
                    <div>Bought: {formatDateDDMMYYYY(r.purchaseDate)}</div>
                    <div style={{ color: "#7b857d" }}>
                      Expires: {formatDateDDMMYYYY(r.expiryDate)}
                    </div>
                  </td>
                  <td>
                    <b
                      style={{
                        color:
                          r.remainingDays <= 30
                            ? "#c62828"
                            : "var(--rf-forest-deep)",
                      }}
                    >
                      {r.remainingDays} Days
                    </b>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getBadgeClass(r.currentStatus || r.status)}`}
                    >
                      {r.currentStatus || r.status}
                    </span>
                  </td>
                  <td>
                    {r.verified ? (
                      <span
                        style={{
                          color: "#17632a",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#c62828",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                  </td>
                  {activeTab === "review_queue" && (
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, "approve")}
                          disabled={updatingId === r.id}
                          style={{
                            background: "#1b5e20",
                            color: "#fff",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, "reject")}
                          disabled={updatingId === r.id}
                          style={{
                            background: "#b71c1c",
                            color: "#fff",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > pageSize && (
        <AdminPagination
          currentPage={page}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="records"
        />
      )}
    </div>
  );
}
