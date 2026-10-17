"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import styles from "./WarrantyPortal.module.css";

export default function WarrantyPortalClient() {
  const [activeTab, setActiveTab] = useState("check"); // 'check' | 'register'

  // Search State
  const [searchMethod, setSearchMethod] = useState("serial"); // 'serial' | 'order'
  const [serialQuery, setSerialQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  // Register State
  const [regForm, setRegForm] = useState({
    productName: "",
    serialNumber: "",
    orderNumber: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    purchaseDate: "",
    category: "furniture",
    durationDays: 365,
    proofOfPurchase: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(null);

  // Handle Search
  async function handleCheckSubmit(e) {
    e.preventDefault();
    setSearchError("");
    setSearchResults(null);
    setSearchLoading(true);

    try {
      let url = "/api/warranty/check?";
      if (searchMethod === "serial") {
        if (!serialQuery.trim()) {
          setSearchError("Please enter a product serial number.");
          setSearchLoading(false);
          return;
        }
        url += `serial=${encodeURIComponent(serialQuery.trim())}`;
      } else {
        if (!phoneQuery.trim() || !orderQuery.trim()) {
          setSearchError(
            "Please enter both Order Number and Registered Phone Number.",
          );
          setSearchLoading(false);
          return;
        }
        url += `phone=${encodeURIComponent(phoneQuery.trim())}&orderNumber=${encodeURIComponent(orderQuery.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            (typeof data?.error === "string" ? data.error : "") ||
            "No matching warranty registration found.",
        );
      }

      setSearchResults(data.registrations || []);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }

  // Handle File Upload
  async function handleProofUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setRegError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "warranty-proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            (typeof data?.error === "string" ? data.error : "") ||
            "Failed to upload proof document.",
        );
      }

      setRegForm((prev) => ({ ...prev, proofOfPurchase: data.url }));
    } catch (err) {
      setRegError(err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  // Handle Register Submit
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegError("");
    setRegSuccess(null);
    setRegLoading(true);

    try {
      const res = await fetch("/api/warranty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            (typeof data?.error === "string" ? data.error : "") ||
            "Failed to register product warranty.",
        );
      }

      setRegSuccess(data);
      // Reset form
      setRegForm({
        productName: "",
        serialNumber: "",
        orderNumber: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        purchaseDate: "",
        category: "furniture",
        durationDays: 365,
        proofOfPurchase: "",
      });
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  }

  const getStatusBadgeClass = (status) => {
    if (status === "active") return styles.statusActive;
    if (status === "expiring_soon") return styles.statusExpiring;
    return styles.statusExpired;
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Active Warranty";
    if (status === "expiring_soon") return "Expiring Soon (< 30 days)";
    return "Warranty Expired";
  };

  return (
    <>
      <header className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroTag}>Official Service & Support</span>
          <h1>Warranty & Protection Portal</h1>
          <p>
            Verify authentic RF Riddhy coverage, check real-time remaining
            warranty days, and register your newly delivered furniture and
            appliances in under 60 seconds.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.portalCard}>
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "check"}
                className={`${styles.tabBtn} ${activeTab === "check" ? styles.active : ""}`}
                onClick={() => setActiveTab("check")}
              >
                <Icon name="search" size={15} /> Check Warranty Status
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "register"}
                className={`${styles.tabBtn} ${activeTab === "register" ? styles.active : ""}`}
                onClick={() => setActiveTab("register")}
              >
                <Icon name="shield" size={15} /> Register New Product
              </button>
            </div>

            {/* TAB 1: CHECK WARRANTY STATUS */}
            {activeTab === "check" && (
              <div className={styles.formBody}>
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "8px" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMethod("serial");
                      setSearchError("");
                      setSearchResults(null);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid var(--rf-line)",
                      background:
                        searchMethod === "serial"
                          ? "var(--rf-forest-deep)"
                          : "#fff",
                      color: searchMethod === "serial" ? "#fff" : "#4a554d",
                    }}
                  >
                    Search by Serial Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMethod("order");
                      setSearchError("");
                      setSearchResults(null);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid var(--rf-line)",
                      background:
                        searchMethod === "order"
                          ? "var(--rf-forest-deep)"
                          : "#fff",
                      color: searchMethod === "order" ? "#fff" : "#4a554d",
                    }}
                  >
                    Search by Phone & Order ID
                  </button>
                </div>

                <form onSubmit={handleCheckSubmit}>
                  {searchMethod === "serial" ? (
                    <div
                      className={styles.field}
                      style={{ marginBottom: "16px" }}
                    >
                      <label htmlFor="serialQuery">
                        Product Serial Number / Warranty Tag
                      </label>
                      <input
                        id="serialQuery"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. RF-SH-2026-8812 or RF-APP-4109"
                        value={serialQuery}
                        onChange={(e) => setSerialQuery(e.target.value)}
                        required
                      />
                      <small style={{ color: "#6a766c", fontSize: "11px" }}>
                        Located on the warranty sticker beneath furniture or
                        behind home appliances.
                      </small>
                    </div>
                  ) : (
                    <div
                      className={styles.formGrid}
                      style={{ marginBottom: "16px" }}
                    >
                      <div className={styles.field}>
                        <label htmlFor="phoneQuery">
                          Registered Phone Number
                        </label>
                        <input
                          id="phoneQuery"
                          type="tel"
                          className={styles.input}
                          placeholder="e.g. 9876543210"
                          value={phoneQuery}
                          onChange={(e) => setPhoneQuery(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="orderQuery">Order Number</label>
                        <input
                          id="orderQuery"
                          type="text"
                          className={styles.input}
                          placeholder="e.g. RF-ORD-9021"
                          value={orderQuery}
                          onChange={(e) => setOrderQuery(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {searchError && (
                    <div className={styles.errorBox}>{searchError}</div>
                  )}

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={searchLoading}
                  >
                    {searchLoading
                      ? "Verifying Registry..."
                      : "Search Warranty Status"}
                  </button>
                </form>

                {/* SEARCH RESULTS CARDS */}
                {searchResults && searchResults.length > 0 && (
                  <div
                    style={{ display: "grid", gap: "20px", marginTop: "24px" }}
                  >
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        color: "var(--rf-forest-deep)",
                      }}
                    >
                      Found {searchResults.length} Active Registration
                      {searchResults.length > 1 ? "s" : ""}:
                    </h3>

                    {searchResults.map((reg) => {
                      const totalDays = reg.durationDays || 365;
                      const percentLeft = Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round((reg.remainingDays / totalDays) * 100),
                        ),
                      );

                      return (
                        <div key={reg.id} className={styles.certCard}>
                          <div className={styles.certHead}>
                            <div>
                              <b>{reg.productName}</b>
                              <span>
                                Serial / Tag:{" "}
                                <strong>{reg.serialNumber || "N/A"}</strong>
                              </span>
                              {reg.orderNumber && (
                                <span>Order Ref: {reg.orderNumber}</span>
                              )}
                            </div>
                            <span
                              className={`${styles.statusBadge} ${getStatusBadgeClass(reg.status)}`}
                            >
                              {getStatusLabel(reg.status)}
                            </span>
                          </div>

                          <div className={styles.daysMeter}>
                            <div className={styles.meterNumbers}>
                              <div>
                                <b>{reg.remainingDays}</b>
                                <span style={{ marginLeft: "6px" }}>
                                  Days Remaining
                                </span>
                              </div>
                              <span>
                                Total Term: {Math.round(totalDays / 365)} Year (
                                {totalDays} Days)
                              </span>
                            </div>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{
                                  width: `${percentLeft}%`,
                                  background:
                                    reg.remainingDays < 30
                                      ? "#d97706"
                                      : reg.remainingDays === 0
                                        ? "#dc2626"
                                        : "linear-gradient(90deg, #174d35, #d99a32)",
                                }}
                              />
                            </div>
                          </div>

                          <div className={styles.certGrid}>
                            <div>
                              <span>Customer Name</span>
                              <b>{reg.customerName || "Verified Buyer"}</b>
                            </div>
                            <div>
                              <span>Purchase Date</span>
                              <b>{reg.purchaseDate}</b>
                            </div>
                            <div>
                              <span>Coverage Starts</span>
                              <b>{reg.activationDate}</b>
                            </div>
                            <div>
                              <span>Coverage Valid Until</span>
                              <b>{reg.expiryDate}</b>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              paddingTop: "10px",
                              borderTop: "1px dashed var(--rf-line)",
                            }}
                          >
                            <a
                              href={`https://wa.me/919934208035?text=${encodeURIComponent(
                                `Hello RF Riddhy Support, I am requesting warranty assistance for product "${reg.productName}" (Serial: ${reg.serialNumber || "N/A"}, Order: ${reg.orderNumber || "N/A"}).`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "8px 16px",
                                borderRadius: "999px",
                                background: "#25D366",
                                color: "#fff",
                                textDecoration: "none",
                                fontSize: "12px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Icon name="whatsapp" size={16} />
                              <span>Request Service on WhatsApp</span>
                            </a>
                            <a
                              href="tel:+919934208035"
                              style={{
                                padding: "8px 16px",
                                borderRadius: "999px",
                                background: "var(--rf-cream-100)",
                                color: "var(--rf-forest-deep)",
                                textDecoration: "none",
                                fontSize: "12px",
                                fontWeight: 700,
                                border: "1px solid var(--rf-line)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Icon name="phone" size={15} />
                              <span>Call Care Desk</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REGISTER NEW PRODUCT */}
            {activeTab === "register" && (
              <div className={styles.formBody}>
                {regSuccess && (
                  <div className={styles.successBox}>
                    <h4
                      style={{
                        margin: "0 0 6px",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Icon name="sparkles" size={16} /> {regSuccess.message}
                    </h4>
                    <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                      Certificate ID:{" "}
                      <strong>{regSuccess.registrationId}</strong> | Valid
                      until: <strong>{regSuccess.expiryDate}</strong> (
                      {regSuccess.remainingDays} days remaining).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSerialQuery(regSuccess.serialNumber);
                        setSearchMethod("serial");
                        setActiveTab("check");
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#1b5e20",
                        color: "#fff",
                        borderRadius: "6px",
                        border: 0,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      View Live Certificate <Icon name="arrow" size={13} />
                    </button>
                  </div>
                )}

                {regError && <div className={styles.errorBox}>{regError}</div>}

                <form onSubmit={handleRegisterSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label htmlFor="regProduct">Product Name *</label>
                      <input
                        id="regProduct"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Teakwood 6-Seater Dining Set"
                        value={regForm.productName}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            productName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regSerial">Serial / Batch Number</label>
                      <input
                        id="regSerial"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. RF-WD-44819 (optional if not labeled)"
                        value={regForm.serialNumber}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            serialNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regCategory">Category</label>
                      <select
                        id="regCategory"
                        className={styles.select}
                        value={regForm.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          const days = cat === "appliances" ? 730 : 365;
                          setRegForm({
                            ...regForm,
                            category: cat,
                            durationDays: days,
                          });
                        }}
                      >
                        <option value="furniture">
                          Handcrafted Furniture (1-3 Year Structural)
                        </option>
                        <option value="appliances">
                          Home Appliance (2-Year Manufacturer)
                        </option>
                        <option value="mattress">
                          Orthopedic Mattress (5-Year Core)
                        </option>
                        <option value="marriage-package">
                          Marriage Package Ensemble
                        </option>
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regDuration">
                        Standard Coverage Policy
                      </label>
                      <select
                        id="regDuration"
                        className={styles.select}
                        value={regForm.durationDays}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            durationDays: Number(e.target.value),
                          })
                        }
                      >
                        <option value={365}>
                          1 Year Comprehensive (365 Days)
                        </option>
                        <option value={730}>
                          2 Years Comprehensive (730 Days)
                        </option>
                        <option value={1095}>
                          3 Years Extended Structural (1095 Days)
                        </option>
                        <option value={1825}>
                          5 Years Termite & Structural (1825 Days)
                        </option>
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regDate">
                        Date of Delivery / Purchase *
                      </label>
                      <input
                        id="regDate"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        className={styles.input}
                        value={regForm.purchaseDate}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            purchaseDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regOrder">
                        Order Number / Invoice No.
                      </label>
                      <input
                        id="regOrder"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. RF-ORD-8821"
                        value={regForm.orderNumber}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            orderNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regCustName">Customer Full Name *</label>
                      <input
                        id="regCustName"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Amit Kumar"
                        value={regForm.customerName}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            customerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="regCustPhone">Phone Number *</label>
                      <input
                        id="regCustPhone"
                        type="tel"
                        className={styles.input}
                        placeholder="e.g. 9876543210"
                        value={regForm.customerPhone}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            customerPhone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className={styles.fullCol}>
                      <div className={styles.field}>
                        <label htmlFor="regProof">
                          Invoice / Delivery Slip (Image or PDF)
                        </label>
                        <input
                          id="regProof"
                          type="file"
                          accept="image/*,application/pdf"
                          className={styles.input}
                          onChange={handleProofUpload}
                          disabled={uploadingFile}
                        />
                        {uploadingFile && (
                          <span style={{ fontSize: "11px", color: "#888" }}>
                            Uploading proof securely...
                          </span>
                        )}
                        {regForm.proofOfPurchase && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#1b5e20",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Icon name="check" size={13} /> Proof attached:{" "}
                            {regForm.proofOfPurchase.split("/").pop()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={regLoading || uploadingFile}
                  >
                    {regLoading
                      ? "Registering..."
                      : "Complete Warranty Registration"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
