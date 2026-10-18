"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Star,
  Copy,
  Archive,
  Loader2,
  Layers,
  DollarSign,
  Boxes,
  Tag,
  ShieldCheck,
  Search,
} from "lucide-react";
import { CATEGORY_SEED } from "@/lib/demo-data";
import styles from "./AdminProductDrawer.module.css";

const TAG_OPTIONS = [
  { id: "best-selling", label: "Best Selling" },
  { id: "popular", label: "Popular" },
  { id: "trending", label: "Trending" },
  { id: "new-arrival", label: "New Arrival" },
  { id: "featured", label: "Featured" },
  { id: "deal", label: "Deal" },
  { id: "limited", label: "Limited" },
];

const MODEL_TYPES = [
  "sofa",
  "bed",
  "wardrobe",
  "dining",
  "study",
  "mattress",
  "decor",
  "storage",
  "refrigerator",
  "washer",
  "ac",
  "tv",
  "microwave",
  "chimney",
  "purifier",
];

export default function AdminProductDrawer({
  isOpen,
  onClose,
  initialData,
  onSaved,
}) {
  const [tab, setTab] = useState("general");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const openMediaLibrary = async () => {
    setShowMediaLibrary(true);
    setLoadingLibrary(true);
    try {
      const res = await fetch("/api/admin/media?limit=60");
      const data = await res.json();
      if (res.ok && data.success) {
        setLibraryAssets(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load media library:", err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const pickLibraryAsset = (asset) => {
    setForm((prev) => {
      const newGallery = [
        ...prev.gallery,
        {
          url: asset.url,
          thumbUrl: asset.thumbUrl || asset.url,
          blurDataURL: asset.blurDataURL,
          alt: asset.alt || prev.name,
          sortOrder: prev.gallery.length,
          mediaId: asset._id,
        },
      ];
      return {
        ...prev,
        gallery: newGallery,
        image: prev.image || asset.url,
      };
    });
    setShowMediaLibrary(false);
  };

  const updateImageAlt = (index, alt) => {
    setForm((prev) => {
      const copy = [...prev.gallery];
      if (copy[index]) {
        copy[index] = { ...copy[index], alt };
      }
      return { ...prev, gallery: copy };
    });
  };

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    type: "furniture",
    modelType: "sofa",
    category: "sofas",
    brand: "RF Riddhy",
    price: "",
    mrp: "",
    discount: "",
    stock: "10",
    hsnCode: "9403",
    status: "draft",
    description: "",
    tagline: "",
    badgeText: "",
    image: "",
    gallery: [],
    tags: [],
    tagOverrides: { pin: [], hide: [] },
    warranty: {
      durationYears: "1",
      durationDays: "365",
      coverage: "1 year comprehensive manufacturer warranty",
      startsOn: "purchase",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      const g =
        initialData.gallery && initialData.gallery.length > 0
          ? initialData.gallery
          : initialData.image
            ? [{ url: initialData.image, sortOrder: 0, alt: initialData.name }]
            : [];

      setForm({
        ...initialData,
        price: String(initialData.price ?? ""),
        mrp: String(initialData.mrp ?? ""),
        discount: String(initialData.discount ?? ""),
        stock: String(initialData.stock ?? "0"),
        hsnCode:
          initialData.hsnCode ||
          (initialData.type === "appliance" ? "8516" : "9403"),
        gallery: g,
        tags: initialData.tags || [],
        tagOverrides: initialData.tagOverrides || { pin: [], hide: [] },
        badgeText: initialData.badgeText || "",
        warranty: initialData.warranty || {
          durationYears: "1",
          durationDays: "365",
          coverage: "1 year comprehensive warranty",
          startsOn: "purchase",
        },
        seo: initialData.seo || {
          metaTitle: initialData.name ? `${initialData.name} | RF Riddhy` : "",
          metaDescription: initialData.description?.slice(0, 160) || "",
        },
      });
    } else {
      setForm({
        name: "",
        slug: "",
        sku: `RF-${Date.now().toString(36).toUpperCase()}`,
        type: "furniture",
        modelType: "sofa",
        category: "sofas",
        brand: "RF Riddhy",
        price: "",
        mrp: "",
        discount: "0",
        stock: "10",
        hsnCode: "9403",
        status: "draft",
        description: "",
        tagline: "",
        badgeText: "",
        image: "",
        gallery: [],
        tags: ["new-arrival"],
        tagOverrides: { pin: [], hide: [] },
        warranty: {
          durationYears: "1",
          durationDays: "365",
          coverage: "1 year comprehensive warranty",
          startsOn: "purchase",
        },
        seo: {
          metaTitle: "",
          metaDescription: "",
        },
      });
    }
    setError("");
    setTab("general");
  }, [initialData, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // Auto slug from name if empty
      if (key === "name" && !initialData && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // Auto update HSN based on type
      if (key === "type") {
        next.hsnCode = value === "appliance" ? "8516" : "9403";
        // adjust default category
        const availableCats = CATEGORY_SEED.filter((c) => c.type === value);
        if (availableCats[0]) next.category = availableCats[0].slug;
      }

      // Auto discount calculation
      if (key === "price" || key === "mrp") {
        const p = Number(key === "price" ? value : prev.price);
        const m = Number(key === "mrp" ? value : prev.mrp);
        if (m > 0 && p > 0 && m >= p) {
          next.discount = String(Math.round(((m - p) / m) * 100));
        }
      }

      return next;
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("storage", "local");

        // Try primary /api/admin/media if available, fallback to /api/upload
        let res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          res = await fetch("/api/upload", { method: "POST", body: formData });
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to upload image.");
        }

        const uploadedUrl = data.data?.url || data.url;
        const uploadedThumb = data.data?.thumbUrl || uploadedUrl;

        setForm((prev) => {
          const newGallery = [
            ...prev.gallery,
            {
              url: uploadedUrl,
              thumbUrl: uploadedThumb,
              alt: prev.name || "Product Image",
              sortOrder: prev.gallery.length,
            },
          ];
          return {
            ...prev,
            gallery: newGallery,
            image: prev.image || uploadedUrl,
          };
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const setPrimaryImage = (index) => {
    setForm((prev) => {
      const item = prev.gallery[index];
      if (!item) return prev;
      const filtered = prev.gallery.filter((_, i) => i !== index);
      const reordered = [item, ...filtered].map((g, i) => ({
        ...g,
        sortOrder: i,
      }));
      return {
        ...prev,
        gallery: reordered,
        image: item.url,
      };
    });
  };

  const moveImage = (index, dir) => {
    setForm((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.gallery.length) return prev;
      const copy = [...prev.gallery];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      const reordered = copy.map((g, i) => ({ ...g, sortOrder: i }));
      return {
        ...prev,
        gallery: reordered,
        image: reordered[0]?.url || "",
      };
    });
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const reordered = prev.gallery
        .filter((_, i) => i !== index)
        .map((g, i) => ({ ...g, sortOrder: i }));
      return {
        ...prev,
        gallery: reordered,
        image: reordered[0]?.url || "",
      };
    });
  };

  const toggleTag = (tagId) => {
    setForm((prev) => {
      const exists = prev.tags.includes(tagId);
      const nextTags = exists
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: nextTags };
    });
  };

  const handleDuplicate = () => {
    setForm((prev) => ({
      ...prev,
      slug: `${prev.slug}-copy`,
      sku: `${prev.sku}-COPY`,
      name: `${prev.name} (Copy)`,
      status: "draft",
    }));
    setError("");
  };

  const handleArchive = async () => {
    if (!initialData?._id && !initialData?.id) return;
    if (
      !confirm(
        "Are you sure you want to archive this product? It will be hidden from storefront listings.",
      )
    )
      return;

    setBusy(true);
    try {
      const pId = initialData._id || initialData.id;
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", id: pId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error?.message || "Failed to archive");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      setTab("general");
      return;
    }
    if (!form.slug.trim()) {
      setError("Product slug is required.");
      setTab("general");
      return;
    }
    if (!form.sku.trim()) {
      setError("SKU is required.");
      setTab("general");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("A valid selling price is required.");
      setTab("pricing");
      return;
    }
    if (!form.mrp || Number(form.mrp) < Number(form.price)) {
      setError("MRP must be greater than or equal to selling price.");
      setTab("pricing");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim().toUpperCase(),
        type: form.type,
        modelType: form.modelType,
        category: form.category,
        brand: form.brand || "RF Riddhy",
        price: Number(form.price),
        mrp: Number(form.mrp),
        discount: Number(form.discount || 0),
        stock: Number(form.stock || 0),
        hsnCode: form.hsnCode || (form.type === "appliance" ? "8516" : "9403"),
        status: form.status,
        description: form.description || "",
        tagline: form.tagline || "",
        badgeText: form.badgeText || "",
        image: form.gallery?.[0]?.url || form.image || "",
        gallery: form.gallery || [],
        tags: form.tags || [],
        tagOverrides: form.tagOverrides || { pin: [], hide: [] },
        warranty: form.warranty || {},
        seo: {
          metaTitle: form.seo?.metaTitle || `${form.name} | RF Riddhy`,
          metaDescription:
            form.seo?.metaDescription || form.description?.slice(0, 160) || "",
        },
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Could not save product.");
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const categories = CATEGORY_SEED.filter((c) => c.type === form.type);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2>
              {initialData
                ? `Edit: ${form.name || form.sku}`
                : "Add New Product"}
            </h2>
            <div className={styles.subtitle}>
              <span>{form.sku || "No SKU assigned"}</span>
              <span>•</span>
              <span style={{ textTransform: "uppercase", fontWeight: 600 }}>
                {form.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "general" ? styles.activeTab : ""}`}
            onClick={() => setTab("general")}
          >
            <Layers size={15} /> General
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "media" ? styles.activeTab : ""}`}
            onClick={() => setTab("media")}
          >
            <ImageIcon size={15} /> Media ({form.gallery?.length || 0})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "pricing" ? styles.activeTab : ""}`}
            onClick={() => setTab("pricing")}
          >
            <DollarSign size={15} /> Pricing & Tax
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "inventory" ? styles.activeTab : ""}`}
            onClick={() => setTab("inventory")}
          >
            <Boxes size={15} /> Inventory
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "tags" ? styles.activeTab : ""}`}
            onClick={() => setTab("tags")}
          >
            <Tag size={15} /> Tags ({form.tags?.length || 0})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "warranty" ? styles.activeTab : ""}`}
            onClick={() => setTab("warranty")}
          >
            <ShieldCheck size={15} /> Warranty
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "seo" ? styles.activeTab : ""}`}
            onClick={() => setTab("seo")}
          >
            <Search size={15} /> SEO
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className={styles.content}>
          {error && (
            <div
              style={{
                padding: "12px 14px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: 8,
                fontSize: "0.85rem",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* TAB: General */}
          {tab === "general" && (
            <div className={styles.section}>
              <div className={styles.fieldGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Mira 3-Seater Premium Sofa"
                  required
                />
              </div>

              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label>Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="mira-3-seater-sofa"
                    required
                  />
                  <span className={styles.hint}>
                    Used in URL: /product/[slug]
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label>SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) =>
                      updateField("sku", e.target.value.toUpperCase())
                    }
                    placeholder="SOFA-MIRA-01"
                    required
                  />
                </div>
              </div>

              <div className={styles.threeCol}>
                <div className={styles.fieldGroup}>
                  <label>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    <option value="furniture">Furniture</option>
                    <option value="appliance">Appliance</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Model Classification</label>
                  <select
                    value={form.modelType}
                    onChange={(e) => updateField("modelType", e.target.value)}
                  >
                    {MODEL_TYPES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label>Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="RF Riddhy"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Publication Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="active">Active (Visible)</option>
                    <option value="archived">Archived (Retired)</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="e.g. Ergonomic lumbar comfort with breathable sage fabric"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Detailed material composition, dimensions, and craft description..."
                />
              </div>
            </div>
          )}

          {/* TAB: Media */}
          {tab === "media" && (
            <div className={styles.section}>
              <label className={styles.uploadDropzone}>
                <Upload size={28} color="#1f5f2e" />
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {uploading
                    ? "Processing & saving image..."
                    : "Click or drop files to upload"}
                </span>
                <span className={styles.hint}>
                  JPG, PNG, WebP up to 8MB. Images are saved locally and
                  auto-resized.
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "4px 0 12px",
                }}
              >
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={openMediaLibrary}
                >
                  <ImageIcon size={15} /> Select from Media Library
                </button>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Product Gallery ({form.gallery?.length || 0} images)
                </label>
                <span
                  className={styles.hint}
                  style={{ display: "block", marginBottom: 8 }}
                >
                  The first image serves as the primary storefront card
                  thumbnail.
                </span>

                {form.gallery?.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#94a3b8",
                      background: "#f8fafc",
                      borderRadius: 8,
                    }}
                  >
                    No gallery images uploaded yet.
                  </div>
                ) : (
                  <div className={styles.galleryGrid}>
                    {form.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className={`${styles.galleryCard} ${idx === 0 ? styles.primaryCard : ""}`}
                      >
                        {idx === 0 && (
                          <span className={styles.primaryBadge}>Primary</span>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.thumbUrl || img.url}
                          alt={img.alt || "Thumb"}
                          className={styles.galleryThumb}
                        />
                        <input
                          type="text"
                          placeholder="Alt text..."
                          value={img.alt || ""}
                          onChange={(e) => updateImageAlt(idx, e.target.value)}
                          style={{
                            width: "100%",
                            fontSize: "0.72rem",
                            padding: "4px 6px",
                            border: "none",
                            borderTop: "1px solid #e2e8f0",
                            background: "#ffffff",
                            color: "#334155",
                          }}
                          title="Edit alt text"
                        />
                        <div className={styles.galleryActions}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {idx !== 0 && (
                              <button
                                type="button"
                                title="Set as primary"
                                className={styles.galleryIconBtn}
                                onClick={() => setPrimaryImage(idx)}
                              >
                                <Star size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Move Left/Up"
                              disabled={idx === 0}
                              className={styles.galleryIconBtn}
                              onClick={() => moveImage(idx, -1)}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              title="Move Right/Down"
                              disabled={idx === form.gallery.length - 1}
                              className={styles.galleryIconBtn}
                              onClick={() => moveImage(idx, 1)}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button
                            type="button"
                            title="Remove image"
                            className={`${styles.galleryIconBtn} ${styles.danger}`}
                            onClick={() => removeImage(idx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Pricing & Tax */}
          {tab === "pricing" && (
            <div className={styles.section}>
              <div className={styles.threeCol}>
                <div className={styles.fieldGroup}>
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="49990"
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>MRP (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.mrp}
                    onChange={(e) => updateField("mrp", e.target.value)}
                    placeholder="59990"
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={form.discount}
                    readOnly
                    style={{
                      background: "#f8fafc",
                      color: "#1f5f2e",
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label>GST Rate (%)</label>
                  <select
                    value={form.gstRate || 18}
                    onChange={(e) =>
                      updateField("gstRate", Number(e.target.value))
                    }
                  >
                    <option value={18}>18% (Standard GST)</option>
                    <option value={12}>12% (Concessional)</option>
                    <option value={28}>28% (Luxury Appliances)</option>
                    <option value={5}>5%</option>
                  </select>
                  <span className={styles.hint}>
                    Split into 9% CGST + 9% SGST intra-state, or 18% IGST
                    inter-state.
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label>HSN / SAC Code</label>
                  <input
                    type="text"
                    value={form.hsnCode}
                    onChange={(e) => updateField("hsnCode", e.target.value)}
                    placeholder="9403"
                  />
                  <span className={styles.hint}>
                    Chapter 94 for Furniture, Chapter 85 for Appliances.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Inventory */}
          {tab === "inventory" && (
            <div className={styles.section}>
              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label>Available Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                    placeholder="10"
                    required
                  />
                  <span className={styles.hint}>
                    Current inventory available for ordering.
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Low Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="4"
                    disabled
                    style={{ background: "#f8fafc" }}
                  />
                  <span className={styles.hint}>
                    Flagged as Low Stock when units &lt;= 5.
                  </span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Fulfilment Warehouse</label>
                <input
                  type="text"
                  value="DELHI-01 (Primary Central Hub)"
                  disabled
                  style={{ background: "#f8fafc", color: "#64748b" }}
                />
              </div>
            </div>
          )}

          {/* TAB: Tags & Merchandising */}
          {tab === "tags" && (
            <div className={styles.section}>
              <div className={styles.fieldGroup}>
                <label>Storefront Placement Tags</label>
                <span className={styles.hint}>
                  Products with these tags automatically power homepage tag
                  rails.
                </span>
                <div className={styles.tagGrid}>
                  {TAG_OPTIONS.map((t) => {
                    const active = form.tags?.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        className={`${styles.tagChip} ${active ? styles.activeTag : ""}`}
                        onClick={() => toggleTag(t.id)}
                      >
                        {active && <Check size={14} />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Custom Badge Text (Optional)</label>
                <input
                  type="text"
                  value={form.badgeText}
                  onChange={(e) => updateField("badgeText", e.target.value)}
                  placeholder="e.g. Festival Special, Limited Edition"
                />
                <span className={styles.hint}>
                  Overwrites standard tag chip on product card top-left corner.
                </span>
              </div>
            </div>
          )}

          {/* TAB: Warranty */}
          {tab === "warranty" && (
            <div className={styles.section}>
              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label>Warranty Coverage Duration (Days)</label>
                  <input
                    type="number"
                    min="30"
                    value={form.warranty?.durationDays || "365"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        warranty: {
                          ...prev.warranty,
                          durationDays: e.target.value,
                        },
                      }))
                    }
                    placeholder="365"
                  />
                  <span className={styles.hint}>
                    365 = 1 Year, 730 = 2 Years, 1825 = 5 Years.
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Warranty Starts On</label>
                  <select
                    value={form.warranty?.startsOn || "purchase"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        warranty: {
                          ...prev.warranty,
                          startsOn: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="purchase">Purchase Date (Standard)</option>
                    <option value="delivery">Delivery Date</option>
                    <option value="installation">
                      Installation Completion Date
                    </option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Warranty Scope & Coverage Text</label>
                <textarea
                  rows={3}
                  value={form.warranty?.coverage || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      warranty: { ...prev.warranty, coverage: e.target.value },
                    }))
                  }
                  placeholder="e.g. 1 year comprehensive on all electronic components, 10 years on inverter compressor."
                />
              </div>
            </div>
          )}

          {/* TAB: SEO */}
          {tab === "seo" && (
            <div className={styles.section}>
              <div className={styles.fieldGroup}>
                <label>Meta Title</label>
                <input
                  type="text"
                  value={form.seo?.metaTitle || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value },
                    }))
                  }
                  placeholder={`${form.name || "Product"} | RF Riddhy`}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Meta Description</label>
                <textarea
                  rows={3}
                  value={form.seo?.metaDescription || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value },
                    }))
                  }
                  placeholder="Compelling 160-character description for Google search results..."
                />
              </div>

              <div className={styles.serpPreview}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  Google Search Result Preview
                </div>
                <div className={styles.serpUrl}>
                  https://rfriddhy.com/product/{form.slug || "product-slug"}
                </div>
                <div className={styles.serpTitle}>
                  {form.seo?.metaTitle ||
                    `${form.name || "Product Name"} | RF Riddhy`}
                </div>
                <div className={styles.serpDesc}>
                  {form.seo?.metaDescription ||
                    form.tagline ||
                    "Explore dimensions, delivery options and warranty details at RF Riddhy."}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              {initialData && (
                <>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={handleArchive}
                    disabled={busy}
                    title="Archive this product"
                  >
                    <Archive size={15} /> Archive
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleDuplicate}
                    disabled={busy}
                    title="Duplicate product details"
                  >
                    <Copy size={15} /> Duplicate
                  </button>
                </>
              )}
            </div>

            <div className={styles.footerRight}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={busy}
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                {initialData ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </form>

        {/* Media Asset Library Modal */}
        {showMediaLibrary && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowMediaLibrary(false)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 12,
                width: "100%",
                maxWidth: 720,
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Media Asset Library
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {loadingLibrary ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#64748b",
                    }}
                  >
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ margin: "0 auto 8px" }}
                    />
                    Loading uploaded assets...
                  </div>
                ) : libraryAssets.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#94a3b8",
                    }}
                  >
                    No media assets found in library. Upload images to populate
                    the library.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {libraryAssets.map((asset) => (
                      <div
                        key={asset._id}
                        onClick={() => pickLibraryAsset(asset)}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "#f8fafc",
                          transition: "all 0.15s ease",
                        }}
                        title={asset.alt || "Click to select into gallery"}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.thumbUrl || asset.url}
                          alt={asset.alt || "Asset"}
                          style={{
                            width: "100%",
                            height: 110,
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            padding: "6px 8px",
                            fontSize: "0.72rem",
                            color: "#475569",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {asset.alt || asset.mime || "Image"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
