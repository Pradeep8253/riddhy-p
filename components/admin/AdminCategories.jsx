"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Layers,
  Tv,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import styles from "./AdminCategories.module.css";

const PRESET_IMAGES = [
  { label: "Sofas", url: "/images/category-sofas.webp", type: "furniture" },
  { label: "Beds", url: "/images/category-beds.webp", type: "furniture" },
  { label: "Wardrobes", url: "/images/category-wardrobes.webp", type: "furniture" },
  { label: "Dining", url: "/images/category-dining.webp", type: "furniture" },
  { label: "Study", url: "/images/category-study.webp", type: "furniture" },
  { label: "Mattresses", url: "/images/category-mattresses.webp", type: "furniture" },
  { label: "Decor", url: "/images/category-decor.webp", type: "furniture" },
  { label: "Storage", url: "/images/category-storage.webp", type: "furniture" },
  { label: "Refrigerators", url: "/images/category-refrigerators.webp", type: "appliance" },
  { label: "Washers", url: "/images/category-washers.webp", type: "appliance" },
  { label: "Air Conditioners", url: "/images/category-ac.webp", type: "appliance" },
  { label: "Televisions", url: "/images/category-tv.webp", type: "appliance" },
  { label: "Microwaves", url: "/images/category-microwave.webp", type: "appliance" },
  { label: "Chimneys", url: "/images/category-chimney.webp", type: "appliance" },
  { label: "Purifiers", url: "/images/category-purifier.webp", type: "appliance" },
];

const ROOM_OPTIONS = [
  { value: "", label: "None / Not Applicable" },
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining", label: "Dining Room" },
  { value: "study", label: "Study / Home Office" },
  { value: "kitchen", label: "Kitchen & Utility" },
];

const initialForm = {
  name: "",
  name_hi: "",
  slug: "",
  type: "furniture",
  room: "",
  image: "/images/category-sofas.webp",
  imageKey: "",
  sortOrder: 0,
  active: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'furniture' | 'appliance'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  // Auto-generate slug from name if user hasn't manually diverged
  const [autoSlug, setAutoSlug] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        setMessage({ text: json.error?.message || "Failed to load categories.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error loading categories.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories
  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      if (typeFilter !== "all" && cat.type !== typeFilter) return false;
      if (statusFilter === "active" && !cat.active) return false;
      if (statusFilter === "inactive" && cat.active) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = cat.name?.toLowerCase().includes(q);
        const matchSlug = cat.slug?.toLowerCase().includes(q);
        const matchHi = cat.name_hi?.toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchHi) return false;
      }
      return true;
    });
  }, [categories, typeFilter, statusFilter, search]);

  // Counts
  const metrics = useMemo(() => {
    const total = categories.length;
    const furniture = categories.filter((c) => c.type === "furniture").length;
    const appliances = categories.filter((c) => c.type === "appliance").length;
    const totalProds = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return { total, furniture, appliances, totalProds };
  }, [categories]);

  // Slug generator helper
  const slugify = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      ...initialForm,
      sortOrder: categories.length + 1,
      image: typeFilter === "appliance" ? "/images/category-refrigerators.webp" : "/images/category-sofas.webp",
      type: typeFilter === "appliance" ? "appliance" : "furniture",
    });
    setAutoSlug(true);
    setError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      name_hi: cat.name_hi || "",
      slug: cat.slug || "",
      type: cat.type || "furniture",
      room: cat.room || "",
      image: cat.image || "/images/category-sofas.webp",
      imageKey: cat.imageKey || "",
      sortOrder: cat.sortOrder ?? 0,
      active: cat.active ?? true,
    });
    setAutoSlug(false);
    setError("");
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      if (formData.name) {
        data.append("productName", formData.name);
        data.append("alt", formData.name);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      const finalUrl = json.data?.url || json.url;
      if (json.success && finalUrl) {
        setFormData((prev) => ({ ...prev, image: finalUrl }));
      } else {
        setError(json.error?.message || "Failed to upload image.");
      }
    } catch {
      setError("Network error while uploading image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggle = async (cat) => {
    const id = cat.id || cat._id;
    if (!id) return;
    const nextActive = !cat.active;

    // Optimistic UI
    setCategories((prev) =>
      prev.map((c) => ((c.id === id || c._id === id) ? { ...c, active: nextActive } : c))
    );

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({
          text: `"${cat.name}" is now ${nextActive ? "Active" : "Paused"}.`,
          type: "success",
        });
      } else {
        loadCategories();
        setMessage({ text: json.error?.message || "Could not update status.", type: "error" });
      }
    } catch {
      loadCategories();
      setMessage({ text: "Failed to update category status.", type: "error" });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category Name is required.");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit
        ? `/api/admin/categories/${editingCategory.id || editingCategory._id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setMessage({
          text: `Category "${formData.name}" ${isEdit ? "updated" : "created"} successfully.`,
          type: "success",
        });
        loadCategories();
      } else {
        setError(json.error?.message || "Failed to save category.");
      }
    } catch {
      setError("Error communicating with server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (force = false) => {
    if (!deleteTarget) return;
    const id = deleteTarget.id || deleteTarget._id;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setMessage({
          text: json.data?.action === "deactivated"
            ? `Category "${deleteTarget.name}" has ${deleteTarget.productCount} linked products and was set to Inactive.`
            : `Category "${deleteTarget.name}" permanently deleted.`,
          type: "success",
        });
        setDeleteTarget(null);
        loadCategories();
      } else {
        setMessage({ text: json.error?.message || "Failed to delete category.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error during delete.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <div className={styles.head}>
        <div>
          <h1>Categories</h1>
          <p>
            Manage furniture & appliance collections. Categories dynamically display on storefront grids and product filters.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={loadCategories}
            title="Refresh list"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            className={styles.createBtn}
            onClick={handleOpenCreate}
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`${styles.bannerMessage} ${
            message.type === "success" ? styles.bannerSuccess : styles.bannerError
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            style={{ background: "none", border: 0, cursor: "pointer", color: "inherit" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Layers size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.total}</span>
            <span className={styles.metricLabel}>Total Categories</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: "#fef6eb", color: "#b56208" }}>
            <Armchair size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.furniture}</span>
            <span className={styles.metricLabel}>Furniture Categories</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: "#eef8f1", color: "#1b632e" }}>
            <Tv size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.appliances}</span>
            <span className={styles.metricLabel}>Appliance Categories</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: "#f4f6fa", color: "#2f568a" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.totalProds}</span>
            <span className={styles.metricLabel}>Products Linked</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Type Filter */}
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${typeFilter === "all" ? styles.pillBtnActive : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All Types
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${typeFilter === "furniture" ? styles.pillBtnActive : ""}`}
              onClick={() => setTypeFilter("furniture")}
            >
              Furniture
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${typeFilter === "appliance" ? styles.pillBtnActive : ""}`}
              onClick={() => setTypeFilter("appliance")}
            >
              Appliances
            </button>
          </div>

          {/* Status Filter */}
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${statusFilter === "all" ? styles.pillBtnActive : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${statusFilter === "active" ? styles.pillBtnActive : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${statusFilter === "inactive" ? styles.pillBtnActive : ""}`}
              onClick={() => setStatusFilter("inactive")}
            >
              Paused
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 size={32} className="animate-spin" style={{ color: "#1b4d27" }} />
          <p>Loading categories from database…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={36} style={{ color: "#95a89b" }} />
          <h3>No categories found</h3>
          <p>Try adjusting your search or add a new category to get started.</p>
          <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((cat) => {
            const isFurniture = cat.type === "furniture";
            const storeUrl = isFurniture ? `/furniture/${cat.slug}` : `/appliances/${cat.slug}`;
            const imgSrc = cat.image || (isFurniture ? "/images/category-sofas.webp" : "/images/category-refrigerators.webp");

            return (
              <div
                key={cat.id || cat._id || cat.slug}
                className={`${styles.card} ${!cat.active ? styles.cardInactive : ""}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.thumbnailWrap}>
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      width={74}
                      height={74}
                      className={styles.thumbnail}
                      unoptimized
                    />
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.titleLine}>
                      <h3 className={styles.cardTitle}>{cat.name}</h3>
                      {cat.name_hi && (
                        <span className={styles.cardTitleHi}>({cat.name_hi})</span>
                      )}
                    </div>

                    <Link
                      href={storeUrl}
                      target="_blank"
                      className={styles.slugRow}
                      title="Open storefront category page"
                    >
                      <span>/{cat.slug}</span>
                      <ExternalLink size={12} />
                    </Link>

                    <div className={styles.tagRow}>
                      <span
                        className={`${styles.typeBadge} ${
                          isFurniture ? styles.typeFurniture : styles.typeAppliance
                        }`}
                      >
                        {cat.type}
                      </span>

                      {cat.room && (
                        <span className={styles.roomBadge}>{cat.room}</span>
                      )}

                      <span className={styles.productCountBadge}>
                        {cat.productCount ?? 0} {cat.productCount === 1 ? "product" : "products"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <label className={styles.toggleLabel}>
                    <span className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={Boolean(cat.active)}
                        onChange={() => handleToggle(cat)}
                      />
                      <span className={styles.slider} />
                    </span>
                    <span>{cat.active ? "Active" : "Paused"}</span>
                  </label>

                  <div className={styles.actionBtns}>
                    <Link
                      href={storeUrl}
                      target="_blank"
                      className={styles.iconBtn}
                      title="View on Storefront"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => setDeleteTarget(cat)}
                      title="Delete / Deactivate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {error && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label>Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Center Tables"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Hindi Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. सेंटर टेबल"
                      value={formData.name_hi}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name_hi: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      placeholder="center-tables"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                    />
                    <span className={styles.fieldHint}>
                      Used in URL: /{formData.type === "appliance" ? "appliances" : "furniture"}/{formData.slug || "slug"}
                    </span>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          type: val,
                          image:
                            val === "appliance"
                              ? "/images/category-refrigerators.webp"
                              : "/images/category-sofas.webp",
                        }));
                      }}
                    >
                      <option value="furniture">Furniture</option>
                      <option value="appliance">Appliance</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label>Associated Room</label>
                    <select
                      value={formData.room}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, room: e.target.value }))
                      }
                    >
                      {ROOM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Sort Order</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sortOrder: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                    <span className={styles.fieldHint}>Lower numbers appear first</span>
                  </div>
                </div>

                {/* Image Section */}
                <div className={styles.imageSection}>
                  <div className={styles.imagePreviewRow}>
                    <div className={styles.previewBox}>
                      {formData.image ? (
                        <Image
                          src={formData.image}
                          alt="Category preview"
                          width={80}
                          height={80}
                          className={styles.previewImg}
                          unoptimized
                        />
                      ) : (
                        <div className={styles.previewPlaceholder}>
                          <Upload size={24} />
                        </div>
                      )}
                    </div>

                    <div className={styles.uploadActions}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={15} className="animate-spin" /> Uploading…
                          </>
                        ) : (
                          <>
                            <Upload size={15} /> Upload Custom Photo
                          </>
                        )}
                      </button>

                      <div className={styles.fieldGroup}>
                        <input
                          type="text"
                          placeholder="Or enter image URL path (/images/... or https://...)"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, image: e.target.value }))
                          }
                          style={{ height: "36px", fontSize: "12px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#617165" }}>
                      OR SELECT A DESIGN PRESET:
                    </label>
                    <div className={styles.presetChips} style={{ marginTop: "6px" }}>
                      {PRESET_IMAGES.filter((p) => p.type === formData.type).map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className={`${styles.presetChip} ${
                            formData.image === p.url ? styles.presetChipActive : ""
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, image: p.url }))}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active switch */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className={styles.toggleLabel}>
                    <span className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, active: e.target.checked }))
                        }
                      />
                      <span className={styles.slider} />
                    </span>
                    <span>Category is Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving || uploading}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirm Dialog */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div
            className={styles.modal}
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={20} color="#b42318" />
                <h2 style={{ fontSize: "18px" }}>Delete Category</h2>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ margin: 0, fontSize: "14px", color: "#3a4a3f", lineHeight: "1.5" }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>

              {deleteTarget.productCount > 0 ? (
                <div
                  style={{
                    padding: "12px",
                    background: "#fef8ee",
                    border: "1px solid #f8dfaf",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#8a5009",
                  }}
                >
                  <strong>Notice:</strong> This category has{" "}
                  <strong>{deleteTarget.productCount}</strong> linked product(s). Deactivating is recommended so existing products remain catalogued.
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "13px", color: "#617165" }}>
                  This category has no linked products and can be safely removed.
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              {deleteTarget.productCount > 0 ? (
                <>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    style={{ background: "#fef8ee", color: "#8a5009", borderColor: "#f8dfaf" }}
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                  >
                    Deactivate Only
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    style={{ background: "#b42318" }}
                    onClick={() => handleDelete(true)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Force Delete"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.saveBtn}
                  style={{ background: "#b42318" }}
                  onClick={() => handleDelete(false)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete Permanently"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
