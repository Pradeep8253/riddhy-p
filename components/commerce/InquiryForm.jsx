"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { tr } from "@/lib/i18n";
import { trackEvent } from "@/lib/track";
import Icon from "@/components/ui/Icon";
import styles from "./InquiryForm.module.css";

const CONSULTATION_TYPES = [
  {
    id: "bulk",
    title: "Bulk Order Inquiry",
    iconName: "building",
    desc: "For businesses, hotels, institutions & large-volume furniture requirements.",
  },
  {
    id: "on_demand",
    title: "On-Demand Order",
    iconName: "palette",
    desc: "Custom designs, unlisted models, or bespoke dimensions with optional photo upload.",
  },
  {
    id: "assistance",
    title: "Need Assistance / Consultation",
    iconName: "lightbulb",
    desc: "Expert help choosing furniture, marriage setups & appliances within your budget.",
  },
  {
    id: "general",
    title: "General Contact",
    iconName: "mail",
    desc: "General questions, feedback, order status, or aftercare support.",
  },
];

const TOPIC_OPTIONS = [
  { value: "product", label: "Product advice & sizing" },
  { value: "order", label: "Order status & tracking" },
  { value: "delivery", label: "Delivery & installation" },
  { value: "warranty", label: "Warranty & aftercare claim" },
  { value: "returns", label: "Returns & refunds" },
  { value: "other", label: "General inquiry" },
];

export default function InquiryForm({
  kind = "contact",
  initialTopic = "other",
}) {
  const locale = useSelector((state) => state.ui?.locale || "en");

  // If kind === 'bulk', default to 'bulk', otherwise 'general' or 'assistance'
  const [inquiryType, setInquiryType] = useState(
    kind === "bulk" ? "bulk" : "general",
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: initialTopic || "other",
    subject: "",
    orderNumber: "",
    message: "",
    // Dynamic fields
    productName: "",
    category: "furniture",
    quantity: 1,
    budgetRange: "₹50,000 – ₹1,50,000",
    deliveryLocation: "",
    preferredDate: "",
    specifications: "",
    intendedUse: "Home Setup",
    preferredContactMethod: "phone",
    referenceImage: "",
    consent: true,
    honeypot: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (kind === "bulk") {
      setInquiryType("bulk");
    }
  }, [kind]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Optional image upload for On-Demand order
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        referenceImage: "Image must be under 10MB.",
      }));
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "on-demand-references");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error?.message ||
            (typeof data?.error === "string" ? data.error : "") ||
            "Failed to upload image.",
        );

      update("referenceImage", data.url);
    } catch (err) {
      setErrors((prev) => ({ ...prev, referenceImage: err.message }));
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Please enter your name (at least 2 characters).";
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      errs.phone = "Enter a valid 10-digit mobile number starting with 6-9.";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }

    // Dynamic validations per type
    if (inquiryType === "bulk") {
      if (!form.quantity || Number(form.quantity) < 1) {
        errs.quantity = "Please enter estimated quantity.";
      }
      if (!form.deliveryLocation.trim()) {
        errs.deliveryLocation = "Please provide destination city or pincode.";
      }
    }

    if (inquiryType === "on_demand") {
      if (!form.productName.trim()) {
        errs.productName = "Please enter the item name or description.";
      }
    }

    if (
      inquiryType === "general" &&
      (!form.message.trim() || form.message.trim().length < 5)
    ) {
      errs.message = "Please provide details describing your question.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setSubmitError("");

    try {
      const payload = {
        ...form,
        inquiryType,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (!response.ok || !json.received) {
        throw new Error(
          json.error?.message ||
            json.error ||
            "Unable to submit your inquiry. Please try again.",
        );
      }

      setSuccessInfo({
        reference: json.reference || "",
        message:
          json.message ||
          "Thank you! Your inquiry has been received. Our team will contact you shortly.",
      });

      trackEvent("inquiry_submit", {
        inquiryType,
        reference: json.reference,
      });

      // Reset
      setForm({
        name: "",
        email: "",
        phone: "",
        topic: "other",
        subject: "",
        orderNumber: "",
        message: "",
        productName: "",
        category: "furniture",
        quantity: 1,
        budgetRange: "₹50,000 – ₹1,50,000",
        deliveryLocation: "",
        preferredDate: "",
        specifications: "",
        intendedUse: "Home Setup",
        preferredContactMethod: "phone",
        referenceImage: "",
        consent: true,
        honeypot: "",
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (successInfo) {
    return (
      <div className={styles.successState} role="status" aria-live="polite">
        <div className={styles.successBadge}>
          <Icon name="check" size={24} />
        </div>
        <h3>Inquiry Registered</h3>
        <p>{successInfo.message}</p>
        {successInfo.reference && (
          <div className={styles.refPill}>
            <span>Official Tracking ID</span>
            <strong>{successInfo.reference}</strong>
          </div>
        )}
        <p style={{ fontSize: "11px", color: "#7a867c" }}>
          Please keep this reference number handy when chatting on WhatsApp or
          calling our customer desk.
        </p>
        <button
          type="button"
          className={styles.sendAnotherBtn}
          onClick={() => setSuccessInfo(null)}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {/* Honeypot field for bot protection */}
      <div className={styles.hpField} aria-hidden="true">
        <label htmlFor="hp_inquiry_field">Leave this empty</label>
        <input
          id="hp_inquiry_field"
          name="hp_phone_verify"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => update("honeypot", e.target.value)}
        />
      </div>

      {submitError && (
        <div className={styles.formAlert} role="alert">
          {submitError}
        </div>
      )}

      {/* 4 CONSULTATION OPTIONS CARDS */}
      <div
        className={styles.typeSelectorGrid}
        role="radiogroup"
        aria-label="Consultation Type"
      >
        {CONSULTATION_TYPES.map((t) => {
          const isSelected = inquiryType === t.id;
          return (
            <button
              type="button"
              key={t.id}
              role="radio"
              aria-checked={isSelected}
              className={`${styles.typeCard} ${isSelected ? styles.typeCardActive : ""}`}
              onClick={() => setInquiryType(t.id)}
            >
              <div className={styles.typeHeader}>
                <span className={styles.typeTitle}>
                  <span className={styles.typeIconWrap}>
                    <Icon name={t.iconName} size={16} />
                  </span>
                  {t.title}
                </span>
                {isSelected && (
                  <span className={styles.typeBadge}>Selected</span>
                )}
              </div>
              <p className={styles.typeDesc}>{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* CORE CONTACT FIELDS */}
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="inquiry_name">{tr(locale, "fullName")} *</label>
          <input
            id="inquiry_name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="e.g. Ramesh Verma"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <span className={styles.inlineErr}>{errors.name}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="inquiry_phone">{tr(locale, "mobileNumber")} *</label>
          <input
            id="inquiry_phone"
            required
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number (e.g. 9876543210)"
            value={form.phone}
            onChange={(e) =>
              update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && (
            <span className={styles.inlineErr}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="inquiry_email">Email Address (Optional)</label>
          <input
            id="inquiry_email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <span className={styles.inlineErr}>{errors.email}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="inquiry_method">Preferred Contact Method</label>
          <select
            id="inquiry_method"
            value={form.preferredContactMethod}
            onChange={(e) => update("preferredContactMethod", e.target.value)}
          >
            <option value="phone">Direct Phone Call</option>
            <option value="whatsapp">WhatsApp Message</option>
            <option value="email">Email Response</option>
            <option value="showroom">Showroom Visit Consultation</option>
          </select>
        </div>
      </div>

      {/* DYNAMIC FIELDS: 1. BULK ORDER INQUIRY */}
      {inquiryType === "bulk" && (
        <div className={styles.fields} style={{ marginTop: "6px" }}>
          <div className={styles.fieldGroup}>
            <label htmlFor="bulk_cat">Product Categories *</label>
            <select
              id="bulk_cat"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="furniture">
                Commercial & Residential Furniture
              </option>
              <option value="appliances">
                Home & Kitchen Appliances in Bulk
              </option>
              <option value="hospitality">
                Hotel / Resort Room Furnishing
              </option>
              <option value="office">Corporate Office Desks & Seating</option>
              <option value="combo">Complete Turnkey Package</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="bulk_qty">Estimated Quantity (Units) *</label>
            <input
              id="bulk_qty"
              type="number"
              min="1"
              max="5000"
              placeholder="e.g. 25"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
            />
            {errors.quantity && (
              <span className={styles.inlineErr}>{errors.quantity}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="bulk_budget">Estimated Budget Range</label>
            <select
              id="bulk_budget"
              value={form.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
            >
              <option value="₹1,00,000 – ₹3,00,000">
                ₹1,00,000 – ₹3,00,000
              </option>
              <option value="₹3,00,000 – ₹7,00,000">
                ₹3,00,000 – ₹7,00,000
              </option>
              <option value="₹7,00,000 – ₹15,00,000">
                ₹7,00,000 – ₹15,00,000
              </option>
              <option value="₹15,00,000+">₹15,00,000+</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="bulk_loc">Delivery Location / City *</label>
            <input
              id="bulk_loc"
              type="text"
              placeholder="e.g. Patna, Bihar or 800001"
              value={form.deliveryLocation}
              onChange={(e) => update("deliveryLocation", e.target.value)}
            />
            {errors.deliveryLocation && (
              <span className={styles.inlineErr}>
                {errors.deliveryLocation}
              </span>
            )}
          </div>

          <div
            className={styles.fieldGroupFull}
            style={{ gridColumn: "1 / -1" }}
          >
            <label htmlFor="bulk_date">
              Preferred Delivery Date / Timeline
            </label>
            <input
              id="bulk_date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.preferredDate}
              onChange={(e) => update("preferredDate", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* DYNAMIC FIELDS: 2. ON-DEMAND ORDER */}
      {inquiryType === "on_demand" && (
        <div className={styles.fields} style={{ marginTop: "6px" }}>
          <div className={styles.fieldGroup}>
            <label htmlFor="od_name">Desired Product Name / Concept *</label>
            <input
              id="od_name"
              type="text"
              placeholder="e.g. Custom 8-Seater Sheesham Dining with Glass Top"
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
            />
            {errors.productName && (
              <span className={styles.inlineErr}>{errors.productName}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="od_cat">Category</label>
            <select
              id="od_cat"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="living">Living Room Furniture</option>
              <option value="bedroom">Bedroom Suite & Wardrobes</option>
              <option value="dining">Dining & Bar Furniture</option>
              <option value="appliances">Special Appliance Sourcing</option>
              <option value="bespoke">Other Bespoke Custom Item</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="od_qty">Quantity</label>
            <input
              id="od_qty"
              type="number"
              min="1"
              max="100"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="od_budget">Target Budget</label>
            <input
              id="od_budget"
              type="text"
              placeholder="e.g. ₹40,000 – ₹60,000"
              value={form.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
            />
          </div>

          <div
            className={styles.fieldGroupFull}
            style={{ gridColumn: "1 / -1" }}
          >
            <label htmlFor="od_specs">
              Preferred Specifications (Dimensions, Wood Finish, Fabric)
            </label>
            <textarea
              id="od_specs"
              rows={3}
              placeholder="e.g. Teak finish, 7x4 feet, cream velvet upholstery, brass leg caps..."
              value={form.specifications}
              onChange={(e) => update("specifications", e.target.value)}
            />
          </div>

          {/* OPTIONAL REFERENCE IMAGE UPLOAD */}
          <div
            className={styles.fieldGroupFull}
            style={{ gridColumn: "1 / -1" }}
          >
            <label htmlFor="od_image">
              Sample / Reference Image (Optional)
            </label>
            <div className={styles.fileInputWrapper}>
              <input
                id="od_image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ background: "transparent", border: 0, padding: 0 }}
              />
              <small style={{ color: "#6a766c", fontSize: "11px" }}>
                Upload a photo or sketch (JPG, PNG, WebP up to 10MB). Not
                mandatory — you can still submit without an image!
              </small>
              {uploadingImage && (
                <span style={{ fontSize: "11px", color: "var(--rf-gold-600)" }}>
                  Uploading image securely...
                </span>
              )}
              {form.referenceImage && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#1b5e20",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Icon name="check" size={14} /> Reference photo attached
                </span>
              )}
              {errors.referenceImage && (
                <span className={styles.inlineErr}>
                  {errors.referenceImage}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC FIELDS: 3. NEED ASSISTANCE / CONSULTATION */}
      {inquiryType === "assistance" && (
        <div className={styles.fields} style={{ marginTop: "6px" }}>
          <div className={styles.fieldGroup}>
            <label htmlFor="ast_cat">Preferred Category of Interest</label>
            <select
              id="ast_cat"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="marriage_setup">Marriage & Wedding Setup</option>
              <option value="new_home">New Home Complete Furnishing</option>
              <option value="appliances">Home Appliances Package</option>
              <option value="living_bedroom">Living & Bedroom Upgrade</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="ast_use">Intended Use / Requirement</label>
            <select
              id="ast_use"
              value={form.intendedUse}
              onChange={(e) => update("intendedUse", e.target.value)}
            >
              <option value="Wedding / Newly Married Couple">
                Wedding / Newly Married Couple
              </option>
              <option value="Family Residence Setup">
                Family Residence Setup
              </option>
              <option value="Rental Property Furnishing">
                Rental Property Furnishing
              </option>
              <option value="Guest House / Holiday Home">
                Guest House / Holiday Home
              </option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="ast_budget">Approximate Budget</label>
            <select
              id="ast_budget"
              value={form.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
            >
              <option value="Under ₹1,00,000">Under ₹1,00,000</option>
              <option value="₹1,00,000 – ₹2,50,000">
                ₹1,00,000 – ₹2,50,000
              </option>
              <option value="₹2,50,000 – ₹5,00,000">
                ₹2,50,000 – ₹5,00,000
              </option>
              <option value="₹5,00,000+ Luxury">₹5,00,000+ Luxury</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="ast_loc">Delivery Town / Pincode</label>
            <input
              id="ast_loc"
              type="text"
              placeholder="e.g. Patna, Gaya, Muzaffarpur..."
              value={form.deliveryLocation}
              onChange={(e) => update("deliveryLocation", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* DYNAMIC FIELDS: 4. GENERAL CONTACT */}
      {inquiryType === "general" && (
        <div className={styles.fields} style={{ marginTop: "6px" }}>
          <div className={styles.fieldGroup}>
            <label htmlFor="gen_topic">{tr(locale, "departmentRouting")}</label>
            <select
              id="gen_topic"
              value={form.topic}
              onChange={(e) => update("topic", e.target.value)}
            >
              {TOPIC_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {["order", "warranty"].includes(form.topic) && (
            <div className={styles.fieldGroup}>
              <label htmlFor="gen_order">Order / Invoice Number</label>
              <input
                id="gen_order"
                type="text"
                placeholder="e.g. RF-2610-1234"
                value={form.orderNumber}
                onChange={(e) => update("orderNumber", e.target.value)}
              />
            </div>
          )}

          <div
            className={styles.fieldGroupFull}
            style={{ gridColumn: "1 / -1" }}
          >
            <label htmlFor="gen_subj">Subject (Optional)</label>
            <input
              id="gen_subj"
              type="text"
              placeholder="Brief summary of your question"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ADDITIONAL MESSAGE / REQUIREMENTS */}
      <div className={styles.fieldGroupFull}>
        <label htmlFor="inquiry_msg">
          {inquiryType === "bulk"
            ? "Additional Specifications or Timeline Requirements"
            : inquiryType === "on_demand"
              ? "Additional Details or Special Requests"
              : inquiryType === "assistance"
                ? "Tell us what you would like advice on"
                : "How can we help? *"}
        </label>
        <textarea
          id="inquiry_msg"
          rows={4}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={
            inquiryType === "bulk"
              ? "Tell us about quantities, floor layout, GST invoicing, or specific room configurations..."
              : inquiryType === "on_demand"
                ? "Specific wood types, polishing sheen, custom dimensions, or deadlines..."
                : inquiryType === "assistance"
                  ? "Describe your room dimensions, color preferences, or which appliances you need matched..."
                  : "Write your message or inquiry here..."
          }
        />
        {errors.message && (
          <span className={styles.inlineErr}>{errors.message}</span>
        )}
      </div>

      <div className={styles.consentRow}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
          />
          <span>
            I agree that RF Riddhy may contact me regarding this enquiry per the{" "}
            <Link
              href="/policies/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy || uploadingImage}
        className={styles.submitBtn}
      >
        {busy ? "Registering Inquiry..." : "Submit Inquiry & Get Tracking ID"}
        <Icon name="arrow" size={16} />
      </button>
    </form>
  );
}
