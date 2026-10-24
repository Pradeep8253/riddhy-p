"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { formatINR } from "@/lib/demo-data";
import styles from "./AdminPackages.module.css";

const emptyPackage = {
  name: "",
  hindiName: "",
  slug: "",
  tier: "shagun",
  tagline: "",
  description: "",
  price: "",
  originalPrice: "",
  highlightBadge: "",
  sortOrder: 0,
  active: true,
  items: [],
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'paused'
  const [isLoading, setIsLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState(emptyPackage);
  const [activeModalTab, setActiveModalTab] = useState("general"); // 'general' | 'items'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packages?all=true");
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
    setFormData({
      ...emptyPackage,
      items: [
        { title: "", quantity: 1, category: "Bedroom Suite", specs: "" }
      ]
    });
    setActiveModalTab("general");
    setIsModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || "",
      hindiName: pkg.hindiName || pkg.name_hi || "",
      slug: pkg.slug || "",
      tier: pkg.tier || "shagun",
      tagline: pkg.tagline || "",
      description: pkg.description || "",
      price: pkg.price || "",
      originalPrice: pkg.originalPrice || "",
      highlightBadge: pkg.highlightBadge || "",
      sortOrder: pkg.sortOrder || 0,
      active: pkg.active !== undefined ? pkg.active : true,
      items: Array.isArray(pkg.items) && pkg.items.length > 0
        ? pkg.items.map((it) => ({
            title: it.title || "",
            quantity: it.quantity || 1,
            category: it.category || "Bedroom Suite",
            specs: it.specs || "",
          }))
        : [],
    });
    setActiveModalTab("general");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setActiveModalTab("general");
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = {
        ...newItems[index],
        [field]: field === "quantity" ? Math.max(1, Number(value) || 1) : value,
      };
      return { ...prev, items: newItems };
    });
  };

  const addItem = (position = "top") => {
    setFormData((prev) => {
      const newItem = {
        title: "",
        quantity: 1,
        category: "Bedroom Suite",
        specs: "",
      };
      const items =
        position === "top"
          ? [newItem, ...(prev.items || [])]
          : [...(prev.items || []), newItem];
      return { ...prev, items };
    });
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const moveItem = (index, direction) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return { ...prev, items: newItems };
    });
  };

  const handleToggle = async (pkg) => {
    const id = pkg.id || pkg._id || pkg.slug;
    if (!id) return;
    const nextActive = !pkg.active;

    // Optimistic UI update so the item never disappears
    setPackages((prev) =>
      prev.map((p) =>
        (p.id === id || p._id === id || (p.slug && p.slug === pkg.slug))
          ? { ...p, active: nextActive }
          : p
      )
    );

    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`✓ "${pkg.name}" is now ${nextActive ? "Active" : "Paused"}.`);
        loadPackages();
      } else {
        loadPackages();
        setMessage(json.error?.message || "Failed to update package status.");
      }
    } catch (err) {
      loadPackages();
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

    // Clean and validate items
    const cleanedItems = (formData.items || [])
      .map((it) => ({
        title: String(it.title || "").trim(),
        quantity: Math.max(1, Number(it.quantity) || 1),
        category: String(it.category || "General").trim(),
        specs: String(it.specs || "").trim(),
      }))
      .filter((it) => it.title.length > 0);

    const derivedCategories = Array.from(
      new Set(cleanedItems.map((it) => it.category).filter(Boolean))
    );

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
          items: cleanedItems,
          categories: derivedCategories.length > 0 ? derivedCategories : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        closeModal();
        loadPackages();
        setMessage(`✓ "${formData.name}" saved successfully with ${cleanedItems.length} items.`);
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
        <div style={{ color: message.startsWith("✓") ? "#1b5e20" : "#c62828", fontSize: 13, fontWeight: 600 }}>{message}</div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        <button
          type="button"
          className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}
          onClick={() => setFilter("all")}
        >
          All Packages <span className={styles.filterCount}>{packages.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.filterTab} ${filter === "active" ? styles.filterTabActive : ""}`}
          onClick={() => setFilter("active")}
        >
          ● Active <span className={styles.filterCount}>{packages.filter((p) => p.active).length}</span>
        </button>
        <button
          type="button"
          className={`${styles.filterTab} ${filter === "paused" ? styles.filterTabActive : ""}`}
          onClick={() => setFilter("paused")}
        >
          ⏸ Paused <span className={styles.filterCount}>{packages.filter((p) => !p.active).length}</span>
        </button>
      </div>

      <div className={styles.cardList}>
        {packages
          .filter((pkg) => {
            if (filter === "active") return pkg.active;
            if (filter === "paused") return !pkg.active;
            return true;
          })
          .map((pkg) => {
            const itemCount = (pkg.items || []).length;
            return (
              <div
                key={pkg.slug || pkg.id || pkg._id}
                className={`${styles.packageRow} ${!pkg.active ? styles.pausedRow : ""}`}
              >
                <div className={styles.packageInfo}>
                  <div className={styles.titleRow}>
                    <span className={styles.badge}>{pkg.tier}</span>
                    <b>{pkg.name}</b>
                    <span
                      className={`${styles.statusPill} ${
                        pkg.active ? styles.activeStatus : styles.inactiveStatus
                      }`}
                    >
                      {pkg.active ? "● Active" : "⏸ Paused"}
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
                    className={`${styles.actionBtn} ${!pkg.active ? styles.resumeBtn : ""}`}
                    onClick={() => handleToggle(pkg)}
                    title={
                      pkg.active
                        ? "Pause this package from live store"
                        : "Resume and show package on live store"
                    }
                  >
                    {pkg.active ? "Pause" : "Resume"}
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

        {!isLoading && packages.filter((pkg) => {
          if (filter === "active") return pkg.active;
          if (filter === "paused") return !pkg.active;
          return true;
        }).length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              background: "#fff",
              borderRadius: 16,
              color: "#7b857d",
            }}
          >
            {filter === "paused"
              ? "No paused packages. All packages are currently active."
              : filter === "active"
              ? "No active packages found."
              : 'No packages configured. Click "+ Create Marriage Package" to add one.'}
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

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalTabs}>
                <button
                  type="button"
                  className={`${styles.modalTab} ${
                    activeModalTab === "general" ? styles.modalTabActive : ""
                  }`}
                  onClick={() => setActiveModalTab("general")}
                >
                  General Details
                </button>
                <button
                  type="button"
                  className={`${styles.modalTab} ${
                    activeModalTab === "items" ? styles.modalTabActive : ""
                  }`}
                  onClick={() => setActiveModalTab("items")}
                >
                  Included Items
                  <span className={styles.tabBadge}>
                    {(formData.items || []).length}
                  </span>
                </button>
              </div>

              <div className={styles.modalBody}>
                {activeModalTab === "general" ? (
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
                      <label>Hindi Name (हिंदी नाम)</label>
                      <input
                        className={styles.input}
                        value={formData.hindiName}
                        onChange={(e) =>
                          setFormData({ ...formData, hindiName: e.target.value })
                        }
                        placeholder="e.g. शगुन पैकेज"
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
                        <option value="shagun">Shagun Collection</option>
                        <option value="lagan">Lagan Collection</option>
                        <option value="kanyadaan">Kanyadaan Collection</option>
                        <option value="griha-lakshmi">Griha Lakshmi Collection</option>
                        <option value="bhagya-shree">Bhagya Shree Collection</option>
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
                        placeholder="e.g. Starter Essential · 15 Items Included"
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
                        placeholder="e.g. 49999"
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
                        placeholder="e.g. 65000"
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
                        placeholder="e.g. Complete 15-item starter package for newly married couples."
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
                ) : (
                  <div>
                    <div className={styles.itemsSectionHead}>
                      <div className={styles.itemsCountSummary}>
                        Package Checklist ·{" "}
                        <span>{(formData.items || []).length} Items Included</span>
                      </div>
                      <button
                        type="button"
                        className={styles.addItemSmallBtn}
                        onClick={() => addItem("top")}
                      >
                        + Add Item (At Top)
                      </button>
                    </div>

                    <div className={styles.itemsListContainer}>
                      {(formData.items || []).map((item, idx) => (
                        <div className={styles.itemCard} key={idx}>
                          <div className={styles.itemCardTop}>
                            <span className={styles.itemIndexPill}>#{idx + 1}</span>
                            <div className={styles.itemTitleWrap}>
                              <input
                                type="text"
                                required
                                className={styles.itemTitleInput}
                                placeholder="Item Title (e.g. Double Bed, 5-Seater Sofa, 32 Smart LED TV)"
                                value={item.title || ""}
                                onChange={(e) =>
                                  handleItemChange(idx, "title", e.target.value)
                                }
                              />
                            </div>
                            <div className={styles.itemQtyWrap}>
                              <label>Qty</label>
                              <input
                                type="number"
                                min="1"
                                className={styles.itemQtyInput}
                                value={item.quantity || 1}
                                onChange={(e) =>
                                  handleItemChange(idx, "quantity", e.target.value)
                                }
                              />
                            </div>
                            <div className={styles.itemCardControls}>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => moveItem(idx, -1)}
                                className={styles.itemIconBtn}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={
                                  idx === (formData.items || []).length - 1
                                }
                                onClick={() => moveItem(idx, 1)}
                                className={styles.itemIconBtn}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                title="Delete Item"
                                onClick={() => removeItem(idx)}
                                className={`${styles.itemIconBtn} ${styles.itemDeleteBtn}`}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div className={styles.itemCardBottom}>
                            <div className={styles.itemCategoryWrap}>
                              <input
                                type="text"
                                list="package-category-list"
                                className={styles.itemCatInput}
                                placeholder="Category (e.g. Bedroom Suite, Home Appliances)"
                                value={item.category || ""}
                                onChange={(e) =>
                                  handleItemChange(idx, "category", e.target.value)
                                }
                              />
                            </div>
                            <div className={styles.itemSpecsWrap}>
                              <input
                                type="text"
                                className={styles.itemSpecsInput}
                                placeholder="Specifications / Description (e.g. Heavy gauge steel with safety locker)"
                                value={item.specs || ""}
                                onChange={(e) =>
                                  handleItemChange(idx, "specs", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={styles.addItemLargeBtn}
                      onClick={() => addItem("top")}
                    >
                      + Add New Item (At Top)
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <div
                  style={{
                    marginRight: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#555",
                  }}
                >
                  <span>
                    Total:{" "}
                    <strong style={{ color: "var(--rf-forest-deep)" }}>
                      {(formData.items || []).length} items
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingPackage
                    ? `Update Package (${(formData.items || []).length} Items)`
                    : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <datalist id="package-category-list">
        <option value="Bedroom Suite" />
        <option value="Living Room Suite" />
        <option value="Storage & Trunks" />
        <option value="Living & Dining" />
        <option value="Home Appliances" />
        <option value="Bedding & Comfort" />
        <option value="Kitchen Care" />
        <option value="Climate & Kitchen" />
        <option value="Laundry Care" />
      </datalist>
    </div>
  );
}
