"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { formatINR } from "@/lib/demo-data";
import styles from "./AdminPackages.module.css";

const emptyPackage = {
  name: "",
  slug: "",
  tier: "basic",
  tagline: "",
  description: "",
  price: "",
  originalPrice: "",
  highlightBadge: "",
  sortOrder: 0,
  active: true,
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState(emptyPackage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packages");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPackages(json.data);
      }
    } catch (err) {
      setMessage("Failed to load marriage packages.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const openCreate = () => {
    setEditingPackage(null);
    setFormData(emptyPackage);
    setIsModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || "",
      slug: pkg.slug || "",
      tier: pkg.tier || "basic",
      tagline: pkg.tagline || "",
      description: pkg.description || "",
      price: pkg.price || "",
      originalPrice: pkg.originalPrice || "",
      highlightBadge: pkg.highlightBadge || "",
      sortOrder: pkg.sortOrder || 0,
      active: pkg.active !== undefined ? pkg.active : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleToggle = async (pkg) => {
    const id = pkg.id || pkg._id;
    if (!id) return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !pkg.active }),
      });
      const json = await res.json();
      if (json.success) {
        loadPackages();
      }
    } catch (err) {
      setMessage("Failed to update package status.");
    }
  };

  const handleDelete = async (pkg) => {
    const id = pkg.id || pkg._id;
    if (!id || !confirm(`Are you sure you want to delete "${pkg.name}"?`))
      return;

    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        loadPackages();
      } else {
        alert(json.error?.message || "Delete failed");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = editingPackage?.id || editingPackage?._id;
    const url = id ? `/api/packages/${id}` : "/api/packages";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: formData.originalPrice
            ? Number(formData.originalPrice)
            : undefined,
          sortOrder: Number(formData.sortOrder),
        }),
      });
      const json = await res.json();
      if (json.success) {
        closeModal();
        loadPackages();
      } else {
        alert(json.error?.message || "Failed to save package");
      }
    } catch (err) {
      alert("Error saving package");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <span className="kicker">Operations · Wedding Catalog</span>
          <h1>Marriage Packages</h1>
          <p>
            Configure and manage wedding furniture and appliance packages.
            Changes reflect live on the <code>/packages</code> store page.
          </p>
        </div>
        <button type="button" className={styles.createBtn} onClick={openCreate}>
          + Create Marriage Package
        </button>
      </div>

      {message && (
        <div style={{ color: "#c62828", fontSize: 13 }}>{message}</div>
      )}

      <div className={styles.cardList}>
        {packages.map((pkg) => {
          const itemCount = (pkg.items || []).length;
          return (
            <div key={pkg.slug || pkg.id} className={styles.packageRow}>
              <div className={styles.packageInfo}>
                <div className={styles.titleRow}>
                  <span className={styles.badge}>{pkg.tier}</span>
                  <b>{pkg.name}</b>
                  <span
                    className={`${styles.statusPill} ${
                      pkg.active ? styles.activeStatus : styles.inactiveStatus
                    }`}
                  >
                    {pkg.active ? "● Active" : "○ Paused"}
                  </span>
                </div>
                <div className={styles.priceText}>
                  {formatINR(pkg.price)}
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#888",
                        textDecoration: "line-through",
                        marginLeft: 6,
                      }}
                    >
                      {formatINR(pkg.originalPrice)}
                    </span>
                  )}
                  {pkg.highlightBadge && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--rf-green-800)",
                        marginLeft: 10,
                        fontWeight: 700,
                      }}
                    >
                      [{pkg.highlightBadge}]
                    </span>
                  )}
                </div>
                <div className={styles.metaText}>
                  Slug: <code>{pkg.slug}</code> · {itemCount} items included ·
                  Order: #{pkg.sortOrder || 0}
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggle(pkg)}
                >
                  {pkg.active ? "Pause" : "Activate"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => openEdit(pkg)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(pkg)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {!isLoading && packages.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              background: "#fff",
              borderRadius: 16,
            }}
          >
            No packages configured. Click "+ Create Marriage Package" to add
            one.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>
                {editingPackage ? "Edit Package" : "Create Marriage Package"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Close modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Package Name *</label>
                    <input
                      required
                      className={styles.input}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Royal Wedding Package"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>URL Slug *</label>
                    <input
                      required
                      className={styles.input}
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="e.g. royal-wedding-package"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Package Tier</label>
                    <select
                      className={styles.select}
                      value={formData.tier}
                      onChange={(e) =>
                        setFormData({ ...formData, tier: e.target.value })
                      }
                    >
                      <option value="basic">Basic Collection</option>
                      <option value="premium">Premium Collection</option>
                      <option value="luxury">Luxury Collection</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Highlight Badge</label>
                    <input
                      className={styles.input}
                      value={formData.highlightBadge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          highlightBadge: e.target.value,
                        })
                      }
                      placeholder="e.g. Most Popular for 2BHK"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Package Price (INR) *</label>
                    <input
                      type="number"
                      required
                      className={styles.input}
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="e.g. 149999"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Original / MRP Value (INR)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="e.g. 195000"
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label>Tagline</label>
                    <input
                      className={styles.input}
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      placeholder="e.g. Complete 2-3 BHK setup with solid Sheesham & inverter appliances"
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label>Description *</label>
                    <textarea
                      required
                      className={styles.textarea}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed overview of what this wedding package offers..."
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Display Sort Order</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: e.target.value })
                      }
                    />
                  </div>

                  <div
                    className={styles.field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 20,
                    }}
                  >
                    <input
                      type="checkbox"
                      id="activePkg"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: "var(--rf-green-700)",
                      }}
                    />
                    <label
                      htmlFor="activePkg"
                      style={{ margin: 0, cursor: "pointer" }}
                    >
                      Publish on website
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
