"use client";

import { formatPriceSafe } from "@/lib/pricing";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bookmark,
  Check,
  ChevronDown,
  Edit2,
  Package,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AdminCatalogue.module.css";
import AdminPagination from "./AdminPagination";
import ExportDropdown from "./ExportDropdown";

const AdminProductDrawer = dynamic(() => import("./AdminProductDrawer"), {
  ssr: false,
  loading: () => null,
});

const AdminImportModal = dynamic(() => import("./AdminImportModal"), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_COLUMNS = {
  select: true,
  product: true,
  category: true,
  type: true,
  price: true,
  mrp: true,
  stock: true,
  status: true,
  tags: true,
  actions: true,
};

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest First (Default)" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "updatedAt:desc", label: "Recently Updated" },
  { value: "name:asc", label: "Name (A to Z)" },
  { value: "name:desc", label: "Name (Z to A)" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "stock:asc", label: "Stock: Low to High" },
  { value: "stock:desc", label: "Stock: High to Low" },
  { value: "sales30d:desc", label: "Best Selling (30d)" },
];

export default function AdminCatalogue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Query Params as state source of truth
  const qParam = searchParams.get("q") || "";
  const pageParam = Math.max(1, Number(searchParams.get("page") || 1));
  const limitParam = Math.min(
    100,
    Math.max(10, Number(searchParams.get("limit") || 25)),
  );
  const sortParam = searchParams.get("sort") || "createdAt:desc";
  const statusParam = searchParams.get("status") || "all";
  const typeParam = searchParams.get("type") || "all";
  const categoryParam = searchParams.get("category") || "all";
  const stockParam = searchParams.get("stock") || "all";
  const tagParam = searchParams.get("tag") || "all";

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(qParam);
  const searchInputRef = useRef(null);

  // Data state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({
    status: { all: 0, draft: 0, active: 0, archived: 0 },
    category: [],
    tag: [],
    stock: { in: 0, low: 0, out: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // UI Table state
  const [density, setDensity] = useState("normal"); // 'dense' | 'normal' | 'comfortable'
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [showColChooser, setShowColChooser] = useState(false);
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Inline edit state: { id, field, value }
  const [inlineEdit, setInlineEdit] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json?.data)) {
          setCategoriesList(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        if (!["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Helper to update URL query params
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === "" || val === "all") {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });
      // Reset page to 1 on filter/search change unless page itself was updated
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounced search handling
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== qParam) {
        updateQuery({ q: searchInput });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, qParam, updateQuery]);

  // Fetch products from server API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (qParam) query.set("q", qParam);
      if (pageParam > 1) query.set("page", String(pageParam));
      query.set("limit", String(limitParam));
      if (sortParam) query.set("sort", sortParam);
      if (statusParam !== "all") query.set("status", statusParam);
      if (typeParam !== "all") query.set("type", typeParam);
      if (categoryParam !== "all") query.set("category", categoryParam);
      if (stockParam !== "all") query.set("stock", stockParam);
      if (tagParam !== "all") query.set("tag", tagParam);

      const res = await fetch(`/api/admin/products?${query.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch catalogue.");
      }

      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
      if (data.meta?.facets) {
        setFacets(data.meta.facets);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    qParam,
    pageParam,
    limitParam,
    sortParam,
    statusParam,
    typeParam,
    categoryParam,
    stockParam,
    tagParam,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Toast auto-clear
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Row selection helpers
  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Quick inline edit commit
  const commitInlineEdit = async () => {
    if (!inlineEdit) return;
    const { id, field, value, originalValue } = inlineEdit;
    if (value === originalValue) {
      setInlineEdit(null);
      return;
    }

    const numVal = Number(value);
    if (isNaN(numVal) || numVal < 0) {
      showToast("Please enter a valid positive number.");
      setInlineEdit(null);
      return;
    }

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: numVal } : item,
      ),
    );
    setInlineEdit(null);

    try {
      const payload = { action: "quickEdit", id, [field]: numVal };
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update");
      }
      showToast(`Updated ${field} successfully.`);
    } catch (err) {
      // Rollback on failure
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: originalValue } : item,
        ),
      );
      showToast(`Error updating ${field}: ${err.message}`);
    }
  };

  // Direct active/pause status toggle from table
  const handleToggleProductStatus = async (product) => {
    const productId = product.id || product._id;
    const oldStatus = product.status;
    const newStatus = oldStatus === "active" ? "draft" : "active";

    // Optimistically update product in local table
    setItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === productId ? { ...item, status: newStatus } : item,
      ),
    );

    // Optimistically update status facet counters
    setFacets((prev) => {
      const copy = { ...prev, status: { ...prev.status } };
      if (oldStatus === "active") {
        copy.status.active = Math.max(0, (copy.status.active || 0) - 1);
        copy.status.draft = (copy.status.draft || 0) + 1;
      } else {
        copy.status.draft = Math.max(0, (copy.status.draft || 0) - 1);
        copy.status.active = (copy.status.active || 0) + 1;
      }
      return copy;
    });

    setTogglingStatusId(productId);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkStatus",
          ids: [productId],
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update status.");
      }
      showToast(
        `"${product.name || product.slug}" is now ${newStatus === "active" ? "Active (Visible)" : "Paused (Hidden)"}.`,
      );
    } catch (err) {
      // Revert on failure
      setItems((prev) =>
        prev.map((item) =>
          (item.id || item._id) === productId ? { ...item, status: oldStatus } : item,
        ),
      );
      showToast(`Error updating status: ${err.message}`);
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Single product soft delete with instant optimistic UI removal
  const handleDeleteProduct = async (product) => {
    const pId = product.id || product._id;
    setDeletingProduct(true);

    // Optimistically remove from table immediately
    setItems((prev) => prev.filter((item) => (item.id || item._id) !== pId));
    setTotal((prev) => Math.max(0, prev - 1));
    setDeleteTargetProduct(null);
    setFacets((prev) => {
      const copy = { ...prev, status: { ...prev.status } };
      if (product.status === "active") {
        copy.status.active = Math.max(0, (copy.status.active || 0) - 1);
      } else if (product.status === "draft") {
        copy.status.draft = Math.max(0, (copy.status.draft || 0) - 1);
      } else if (product.status === "archived") {
        copy.status.archived = Math.max(0, (copy.status.archived || 0) - 1);
      }
      return copy;
    });

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: pId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete product.");
      }
      showToast(`Product "${product.name || product.slug}" deleted successfully.`);
      fetchProducts();
    } catch (err) {
      showToast(`Error deleting product: ${err.message}`);
      fetchProducts();
    } finally {
      setDeletingProduct(false);
    }
  };

  // Bulk actions executor
  const handleBulkAction = async (actionType, value) => {
    if (!selectedIds.length) return;
    try {
      let payload = {};
      if (actionType === "status") {
        payload = { action: "bulkStatus", ids: selectedIds, status: value };
      } else if (actionType === "addTag") {
        payload = { action: "bulkAddTag", ids: selectedIds, tag: value };
      } else if (actionType === "removeTag") {
        payload = { action: "bulkRemoveTag", ids: selectedIds, tag: value };
      } else if (actionType === "category") {
        payload = { action: "bulkCategory", ids: selectedIds, category: value };
      } else if (actionType === "archive") {
        if (!confirm(`Archive ${selectedIds.length} selected products?`))
          return;
        payload = { action: "bulkArchive", ids: selectedIds };
      } else if (actionType === "delete") {
        if (
          !confirm(
            `Are you sure you want to delete ${selectedIds.length} selected product(s)? They will be removed from your catalog and storefront.`,
          )
        )
          return;
        // Optimistically remove from table immediately
        setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id || item._id)));
        setTotal((prev) => Math.max(0, prev - selectedIds.length));
        payload = { action: "bulkDelete", ids: selectedIds };
        setSelectedIds([]);
      }

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Bulk operation failed");
      }

      showToast(`Bulk update applied to ${selectedIds.length} products.`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      showToast(`Bulk error: ${err.message}`);
    }
  };

  // Active filter count and pills
  const activeFilters = useMemo(() => {
    const list = [];
    if (statusParam !== "all")
      list.push({ key: "status", label: `Status: ${statusParam}` });
    if (typeParam !== "all")
      list.push({ key: "type", label: `Type: ${typeParam}` });
    if (categoryParam !== "all") {
      const catObj = categoriesList.find((c) => c.slug === categoryParam);
      list.push({
        key: "category",
        label: `Category: ${catObj ? catObj.name : categoryParam}`,
      });
    }
    if (stockParam !== "all") {
      const label =
        stockParam === "in"
          ? "In Stock"
          : stockParam === "low"
            ? "Low Stock"
            : "Out of Stock";
      list.push({ key: "stock", label: `Stock: ${label}` });
    }
    if (tagParam !== "all")
      list.push({ key: "tag", label: `Tag: ${tagParam}` });
    if (qParam) list.push({ key: "q", label: `Search: "${qParam}"` });
    return list;
  }, [statusParam, typeParam, categoryParam, stockParam, tagParam, qParam]);

  const clearAllFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const removeSingleFilter = (key) => {
    if (key === "q") setSearchInput("");
    updateQuery({ [key]: null });
  };

  // Saved view handler
  const applySavedView = (viewKey) => {
    setShowSavedViews(false);
    if (viewKey === "all") {
      router.replace(pathname, { scroll: false });
    } else if (viewKey === "low_stock") {
      updateQuery({ stock: "low", status: "active" });
    } else if (viewKey === "drafts") {
      updateQuery({ status: "draft", stock: "all" });
    } else if (viewKey === "best_sellers") {
      updateQuery({ tag: "best-selling", sort: "sales30d:desc" });
    } else if (viewKey === "archived") {
      updateQuery({ status: "archived" });
    }
  };

  // Column definitions for export
  const exportColumns = useMemo(
    () => [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Product Name" },
      { key: "category", label: "Category" },
      { key: "type", label: "Type" },
      { key: "price", label: "Selling Price (INR)", getValue: (r) => r.price },
      { key: "mrp", label: "MRP (INR)", getValue: (r) => r.mrp },
      { key: "stock", label: "Stock Available", getValue: (r) => r.stock },
      { key: "status", label: "Status" },
      {
        key: "tags",
        label: "Tags",
        getValue: (r) => (r.tags || []).join(", "),
      },
      { key: "hsnCode", label: "HSN Code" },
    ],
    [],
  );

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Header */}
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1>Product Catalogue</h1>
          <p>
            Enterprise inventory, multi-channel pricing, and merchandising
            controls.
          </p>
        </div>

        <div className={styles.headActions}>
          {/* Saved Views Popover */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setShowSavedViews(!showSavedViews)}
            >
              <Bookmark size={15} /> Views <ChevronDown size={14} />
            </button>
            {showSavedViews && (
              <div className={styles.popover}>
                <div className={styles.popoverTitle}>Standard Views</div>
                <div
                  className={styles.popoverItem}
                  onClick={() => applySavedView("all")}
                >
                  All Products ({facets.status?.all || 0})
                </div>
                <div
                  className={styles.popoverItem}
                  onClick={() => applySavedView("low_stock")}
                >
                  Low Stock Alert ({facets.stock?.low || 0})
                </div>
                <div
                  className={styles.popoverItem}
                  onClick={() => applySavedView("drafts")}
                >
                  Drafts &amp; Pending ({facets.status?.draft || 0})
                </div>
                <div
                  className={styles.popoverItem}
                  onClick={() => applySavedView("best_sellers")}
                >
                  Best Sellers Rail
                </div>
                <div
                  className={styles.popoverItem}
                  onClick={() => applySavedView("archived")}
                >
                  Archived Catalog ({facets.status?.archived || 0})
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown with Server-Side XLSX/CSV Streaming */}
          <ExportDropdown
            title="Catalogue Export"
            filename={`catalogue-${new Date().toISOString().slice(0, 10)}`}
            columns={exportColumns}
            data={items}
            apiEndpoint="/api/admin/products/export"
            queryParams={searchParams.toString()}
            selectedCount={selectedIds.length}
          />

          {/* Import Button */}
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setImportModalOpen(true)}
            title="Import products from Excel/CSV"
          >
            <Upload size={15} /> Import
          </button>

          {/* Add Product Button */}
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              setEditingProduct(null);
              setDrawerOpen(true);
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Status Bar / Tabs */}
      <div className={styles.statusTabs}>
        <button
          type="button"
          className={`${styles.statusTab} ${statusParam === "all" ? styles.activeStatus : ""}`}
          onClick={() => updateQuery({ status: "all" })}
        >
          All Items{" "}
          <span className={styles.tabBadge}>{facets.status?.all || 0}</span>
        </button>
        <button
          type="button"
          className={`${styles.statusTab} ${statusParam === "active" ? styles.activeStatus : ""}`}
          onClick={() => updateQuery({ status: "active" })}
        >
          Active{" "}
          <span className={styles.tabBadge}>{facets.status?.active || 0}</span>
        </button>
        <button
          type="button"
          className={`${styles.statusTab} ${statusParam === "draft" ? styles.activeStatus : ""}`}
          onClick={() => updateQuery({ status: "draft" })}
        >
          Drafts{" "}
          <span className={styles.tabBadge}>{facets.status?.draft || 0}</span>
        </button>
        <button
          type="button"
          className={`${styles.statusTab} ${statusParam === "archived" ? styles.activeStatus : ""}`}
          onClick={() => updateQuery({ status: "archived" })}
        >
          Archived{" "}
          <span className={styles.tabBadge}>
            {facets.status?.archived || 0}
          </span>
        </button>
      </div>

      {/* Main Filter & Action Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Debounced Search Box with `/` shortcut */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, SKU, brand, category, tags..."
              className={styles.searchInput}
            />
            {searchInput ? (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => {
                  setSearchInput("");
                  updateQuery({ q: null });
                }}
              >
                <X size={14} />
              </button>
            ) : (
              <span className={styles.searchKbd}>/</span>
            )}
          </div>

          {/* Type Filter */}
          <select
            className={styles.filterSelect}
            value={typeParam}
            onChange={(e) => updateQuery({ type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="furniture">Furniture</option>
            <option value="appliance">Appliances</option>
            <option value="utensils">Utensils</option>
          </select>

          {/* Category Filter */}
          <select
            className={styles.filterSelect}
            value={categoryParam}
            onChange={(e) => updateQuery({ category: e.target.value })}
          >
            <option value="all">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.slug || c.id || c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Bucket Filter */}
          <select
            className={styles.filterSelect}
            value={stockParam}
            onChange={(e) => updateQuery({ stock: e.target.value })}
          >
            <option value="all">Stock (All)</option>
            <option value="in">In Stock ({facets.stock?.in || 0})</option>
            <option value="low">
              Low Stock (≤5) ({facets.stock?.low || 0})
            </option>
            <option value="out">Out of Stock ({facets.stock?.out || 0})</option>
          </select>

          {/* Tag Filter */}
          <select
            className={styles.filterSelect}
            value={tagParam}
            onChange={(e) => updateQuery({ tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="best-selling">Best Selling</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
            <option value="new-arrival">New Arrival</option>
            <option value="deal">Deals</option>
            <option value="limited">Limited</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          {/* Sort Selector */}
          <select
            className={styles.filterSelect}
            value={sortParam}
            onChange={(e) => updateQuery({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Density Toggle */}
          <select
            className={styles.filterSelect}
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            title="Row density"
          >
            <option value="dense">Dense</option>
            <option value="normal">Normal</option>
            <option value="comfortable">Comfortable</option>
          </select>

          {/* Column Chooser Popover */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setShowColChooser(!showColChooser)}
              title="Choose visible columns"
            >
              <SlidersHorizontal size={15} />
            </button>
            {showColChooser && (
              <div className={styles.popover}>
                <div className={styles.popoverTitle}>Visible Columns</div>
                {Object.keys(DEFAULT_COLUMNS).map((col) => (
                  <label key={col} className={styles.popoverItem}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col]: e.target.checked,
                        }))
                      }
                    />
                    <span style={{ textTransform: "capitalize" }}>{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {activeFilters.length > 0 && (
        <div className={styles.activePills}>
          <span className={styles.pillLabel}>Active Filters:</span>
          {activeFilters.map((f) => (
            <span key={f.key} className={styles.pill}>
              {f.label}
              <button
                type="button"
                className={styles.pillClose}
                onClick={() => removeSingleFilter(f.key)}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={clearAllFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Table Container */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles[density]}`}>
            <thead>
              <tr>
                {visibleColumns.select && (
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all products on page"
                    />
                  </th>
                )}
                {visibleColumns.product && <th>Product &amp; SKU</th>}
                {visibleColumns.category && <th>Category</th>}
                {visibleColumns.type && <th>Type</th>}
                {visibleColumns.price && <th>Price (₹)</th>}
                {visibleColumns.mrp && <th>MRP (₹)</th>}
                {visibleColumns.stock && <th>Stock</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.tags && <th>Tags</th>}
                {visibleColumns.actions && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Skeleton loading rows */}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} className={styles.skeletonRow}>
                    {visibleColumns.select && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 16 }}
                        />
                      </td>
                    )}
                    {visibleColumns.product && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 180 }}
                        />
                      </td>
                    )}
                    {visibleColumns.category && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 90 }}
                        />
                      </td>
                    )}
                    {visibleColumns.type && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 60 }}
                        />
                      </td>
                    )}
                    {visibleColumns.price && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 70 }}
                        />
                      </td>
                    )}
                    {visibleColumns.mrp && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 70 }}
                        />
                      </td>
                    )}
                    {visibleColumns.stock && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 40 }}
                        />
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 60 }}
                        />
                      </td>
                    )}
                    {visibleColumns.tags && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 80 }}
                        />
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td>
                        <div
                          className={styles.skeletonBlock}
                          style={{ width: 40 }}
                        />
                      </td>
                    )}
                  </tr>
                ))}

              {/* Error State */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "#dc2626",
                    }}
                  >
                    <AlertCircle size={32} style={{ margin: "0 auto 8px" }} />
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginBottom: 6,
                      }}
                    >
                      Unable to load products
                    </div>
                    <div style={{ fontSize: "0.85rem", marginBottom: 12 }}>
                      {error}
                    </div>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={fetchProducts}
                    >
                      <RotateCcw size={14} /> Retry
                    </button>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className={styles.emptyState}>
                      <Package size={40} color="#94a3b8" />
                      <h3 className={styles.emptyTitle}>No products found</h3>
                      <p className={styles.emptyText}>
                        No records match the current filter or search criteria.
                        Try modifying your filters or reset to view all.
                      </p>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={clearAllFilters}
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading &&
                !error &&
                items.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isLow = product.stock > 0 && product.stock <= 5;
                  const isOut = product.stock <= 0;

                  return (
                    <tr
                      key={product.id}
                      className={isSelected ? styles.selectedRow : ""}
                    >
                      {visibleColumns.select && (
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                      )}

                      {/* Product & SKU */}
                      {visibleColumns.product && (
                        <td>
                          <div className={styles.productCell}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                product.gallery?.[0]?.thumbUrl ||
                                product.gallery?.[0]?.url ||
                                product.image ||
                                "/images/placeholder.webp"
                              }
                              alt={product.name}
                              className={styles.productThumb}
                            />
                            <div className={styles.productMeta}>
                              <span
                                className={styles.productName}
                                onClick={() => {
                                  setEditingProduct(product);
                                  setDrawerOpen(true);
                                }}
                              >
                                {product.name}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span className={styles.productSku}>
                                  {product.sku || "NO-SKU"}
                                </span>
                                {!product.hsnCode && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      padding: "1px 5px",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Missing HSN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <td>
                          <span style={{ fontWeight: 500 }}>
                            {product.categoryLabel || product.category}
                          </span>
                        </td>
                      )}

                      {/* Type */}
                      {visibleColumns.type && (
                        <td>
                          <span
                            style={{
                              textTransform: "capitalize",
                              color: "#64748b",
                            }}
                          >
                            {product.type}
                          </span>
                        </td>
                      )}

                      {/* Selling Price (Quick Inline Edit) */}
                      {visibleColumns.price && (
                        <td>
                          {inlineEdit?.id === product.id &&
                          inlineEdit?.field === "price" ? (
                            <div className={styles.editInputWrap}>
                              <input
                                autoFocus
                                type="number"
                                className={styles.inlineInput}
                                value={inlineEdit.value}
                                onChange={(e) =>
                                  setInlineEdit({
                                    ...inlineEdit,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitInlineEdit();
                                  if (e.key === "Escape") setInlineEdit(null);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={commitInlineEdit}
                              >
                                <Check size={14} color="#16a34a" />
                              </button>
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={() => setInlineEdit(null)}
                              >
                                <X size={14} color="#dc2626" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={styles.editableCell}
                              title="Double click to edit price"
                              onDoubleClick={() =>
                                setInlineEdit({
                                  id: product.id,
                                  field: "price",
                                  value: String(product.price),
                                  originalValue: product.price,
                                })
                              }
                            >
                              <b>{formatPriceSafe(product.price) || "—"}</b>
                              <Edit2 size={12} color="#94a3b8" />
                            </span>
                          )}
                        </td>
                      )}

                      {/* MRP (Quick Inline Edit) */}
                      {visibleColumns.mrp && (
                        <td>
                          {inlineEdit?.id === product.id &&
                          inlineEdit?.field === "mrp" ? (
                            <div className={styles.editInputWrap}>
                              <input
                                autoFocus
                                type="number"
                                className={styles.inlineInput}
                                value={inlineEdit.value}
                                onChange={(e) =>
                                  setInlineEdit({
                                    ...inlineEdit,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitInlineEdit();
                                  if (e.key === "Escape") setInlineEdit(null);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={commitInlineEdit}
                              >
                                <Check size={14} color="#16a34a" />
                              </button>
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={() => setInlineEdit(null)}
                              >
                                <X size={14} color="#dc2626" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={styles.editableCell}
                              title="Double click to edit MRP"
                              onDoubleClick={() =>
                                setInlineEdit({
                                  id: product.id,
                                  field: "mrp",
                                  value: String(product.mrp),
                                  originalValue: product.mrp,
                                })
                              }
                            >
                              <span style={{ color: "#64748b" }}>
                                {formatPriceSafe(product.mrp) || "—"}
                              </span>
                              <Edit2 size={12} color="#94a3b8" />
                            </span>
                          )}
                        </td>
                      )}

                      {/* Stock (Quick Inline Edit) */}
                      {visibleColumns.stock && (
                        <td>
                          {inlineEdit?.id === product.id &&
                          inlineEdit?.field === "stock" ? (
                            <div className={styles.editInputWrap}>
                              <input
                                autoFocus
                                type="number"
                                className={styles.inlineInput}
                                style={{ width: 60 }}
                                value={inlineEdit.value}
                                onChange={(e) =>
                                  setInlineEdit({
                                    ...inlineEdit,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitInlineEdit();
                                  if (e.key === "Escape") setInlineEdit(null);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={commitInlineEdit}
                              >
                                <Check size={14} color="#16a34a" />
                              </button>
                              <button
                                type="button"
                                className={styles.pillClose}
                                onClick={() => setInlineEdit(null)}
                              >
                                <X size={14} color="#dc2626" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`${styles.editableCell} ${
                                isOut
                                  ? styles.stockOut
                                  : isLow
                                    ? styles.stockLow
                                    : styles.stockIn
                              }`}
                              title="Double click to edit available stock"
                              onDoubleClick={() =>
                                setInlineEdit({
                                  id: product.id,
                                  field: "stock",
                                  value: String(product.stock),
                                  originalValue: product.stock,
                                })
                              }
                            >
                              {product.stock}{" "}
                              {isOut ? "(Out)" : isLow ? "(Low)" : "units"}
                              <Edit2 size={12} color="#94a3b8" />
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <label
                              className={styles.switch}
                              title={`Click to ${product.status === "active" ? "Pause" : "Activate"} product`}
                              style={{ margin: 0 }}
                            >
                              <input
                                type="checkbox"
                                checked={product.status === "active"}
                                disabled={togglingStatusId === (product.id || product._id)}
                                onChange={() => handleToggleProductStatus(product)}
                              />
                              <span className={styles.slider} />
                            </label>
                            <span
                              onClick={() => handleToggleProductStatus(product)}
                              title={`Click to ${product.status === "active" ? "Pause" : "Activate"} product`}
                              className={`${styles.statusBadge} ${
                                product.status === "active"
                                  ? styles.statusActive
                                  : product.status === "draft"
                                    ? styles.statusDraft
                                    : styles.statusArchived
                              }`}
                            >
                              {product.status === "active"
                                ? "Active"
                                : product.status === "draft"
                                  ? "Paused"
                                  : product.status}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Tags */}
                      {visibleColumns.tags && (
                        <td>
                          <div className={styles.tableTags}>
                            {product.tags && product.tags.length > 0 ? (
                              product.tags.map((t) => (
                                <span key={t} className={styles.tableTagChip}>
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: "#cbd5e1" }}>—</span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              gap: "6px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              type="button"
                              className={styles.btnSecondary}
                              style={{ padding: "6px 10px" }}
                              onClick={() => {
                                setEditingProduct(product);
                                setDrawerOpen(true);
                              }}
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className={styles.btnSecondary}
                              style={{
                                padding: "6px 10px",
                                color: "#b42318",
                                borderColor: "#fecdd3",
                                background: "#fff1f2",
                              }}
                              title="Delete product"
                              onClick={() => setDeleteTargetProduct(product)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination Component */}
        <AdminPagination
          currentPage={pageParam}
          totalItems={total}
          pageSize={limitParam}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={(newPage) => updateQuery({ page: newPage })}
          onPageSizeChange={(newSize) =>
            updateQuery({ limit: newSize, page: 1 })
          }
        />
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>
            {selectedIds.length} products selected
          </span>

          {/* Change Status */}
          <select
            className={styles.bulkSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleBulkAction("status", e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>
              Set Status...
            </option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Add Tag */}
          <select
            className={styles.bulkSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleBulkAction("addTag", e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>
              Add Tag...
            </option>
            <option value="best-selling">Best Selling</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
            <option value="new-arrival">New Arrival</option>
            <option value="deal">Deal</option>
            <option value="limited">Limited</option>
          </select>

          {/* Remove Tag */}
          <select
            className={styles.bulkSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleBulkAction("removeTag", e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>
              Remove Tag...
            </option>
            <option value="best-selling">Best Selling</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
            <option value="new-arrival">New Arrival</option>
            <option value="deal">Deal</option>
          </select>

          {/* Delete */}
          <button
            type="button"
            className={`${styles.bulkBtn} ${styles.danger}`}
            style={{ background: "#b42318", color: "#fff", borderColor: "#b42318" }}
            onClick={() => handleBulkAction("delete")}
          >
            <Trash2 size={14} /> Delete
          </button>

          {/* Archive */}
          <button
            type="button"
            className={`${styles.bulkBtn} ${styles.danger}`}
            onClick={() => handleBulkAction("archive")}
          >
            <Archive size={14} /> Archive
          </button>

          {/* Deselect All */}
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => setSelectedIds([])}
          >
            <X size={14} /> Clear Selection
          </button>
        </div>
      )}

      {/* Delete Product Confirmation Dialog */}
      {deleteTargetProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setDeleteTargetProduct(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              maxWidth: "460px",
              width: "100%",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={20} color="#b42318" />
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Delete Product
                </h2>
              </div>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  borderRadius: "6px",
                }}
                onClick={() => setDeleteTargetProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.5" }}>
                Are you sure you want to delete <strong>{deleteTargetProduct.name}</strong>?
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.4" }}>
                This product will be removed from your catalogue listings and storefront.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                padding: "14px 20px",
                background: "#f8fafc",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTargetProduct(null)}
                disabled={deletingProduct}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.bulkBtn}
                style={{ background: "#b42318", color: "#fff", borderColor: "#b42318" }}
                disabled={deletingProduct}
                onClick={() => handleDeleteProduct(deleteTargetProduct)}
              >
                {deletingProduct ? "Deleting…" : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Product Drawer */}
      <AdminProductDrawer
        isOpen={drawerOpen}
        initialData={editingProduct}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
        }}
        onSaved={() => {
          showToast("Product successfully saved.");
          fetchProducts();
        }}
      />

      {/* Import Modal */}
      <AdminImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          showToast("Catalogue import finished successfully.");
          fetchProducts();
        }}
      />
    </div>
  );
}
