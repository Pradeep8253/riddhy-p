"use client";

import { useEffect, useState, useRef } from "react";
import { IMG } from "@/lib/images";
import Icon from "@/components/ui/Icon";
import styles from "./AdminCampaigns.module.css";

const FESTIVAL_PRESETS = [
  {
    name: "Diwali Mega Utsav",
    campaignTag: "🪔 DIWALI DHAMAKA SALE",
    title: "Diwali Dhamaka Offer",
    subtitle: "Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech",
    description:
      "Celebrate with Up to 40% OFF + Handcrafted Teak & Smart Inverter Tech in Prayagraj.",
    ctaText: "Tap to Claim on WhatsApp",
    href: "/offers",
    desktopImage: "/images/diwali-dhamaka-banner.jpg",
    mobileImage: "/images/diwali-dhamaka-banner.jpg",
    offerCode: "DIWALI10",
    offerDescription: "Instant 10% OFF + Free Delivery & Setup in Prayagraj",
    zone: "all",
    isOfferModal: true,
  },
  {
    name: "Royal Wedding Season",
    campaignTag: "💍 WEDDING SEASON SPECIAL",
    title: "Marriage & Home Packages",
    subtitle: "Everything for your new beginning",
    description:
      "Customizable packages from ₹99,999 with 5-year structural warranty & priority delivery scheduling.",
    ctaText: "Explore Packages",
    href: "/packages",
    desktopImage: "/images/hero-wedding-package.jpg",
    mobileImage: "/images/hero-desktop.webp",
    offerCode: "WEDDING20",
    offerDescription: "Flat ₹15,000 OFF on Complete Marriage Furniture & Appliance Suites",
    zone: "all",
    isOfferModal: true,
  },
  {
    name: "Holi Home Refresh",
    campaignTag: "🎨 HOLI CELEBRATION CARNIVAL",
    title: "Vibrant Colors for Thoughtful Spaces",
    subtitle: "Stain-resistant upholstery & solid wood masterpieces",
    description:
      "Refresh your living space with festive savings on premium sofas, recliners, and smart appliances.",
    ctaText: "Shop Collection",
    href: "/furniture",
    desktopImage: "/images/hero-living-luxury.jpg",
    mobileImage: "/images/hero-desktop.webp",
    offerCode: "HOLI15",
    offerDescription: "Instant 15% OFF on Living Room Suites & Soft Furnishings",
    zone: "all",
    isOfferModal: true,
  },
  {
    name: "Summer Appliance Carnival",
    campaignTag: "⚡ APPLIANCE CARNIVAL",
    title: "Power Your Everyday",
    subtitle: "Refrigeration, Laundry & Kitchen Tech",
    description:
      "Certified energy-saving appliances with official brand warranties and certified home installation.",
    ctaText: "Shop Appliances",
    href: "/appliances",
    desktopImage: "/images/hero-appliances-suite.jpg",
    mobileImage: "/images/hero-desktop.webp",
    offerCode: "APPLIANCE15",
    offerDescription: "Up to ₹8,000 Exchange Bonus on 5-Star Inverter Appliances",
    zone: "home-hero",
    isOfferModal: false,
  },
];

const QUICK_BADGES = [
  "🪔 DIWALI DHAMAKA SALE",
  "💍 WEDDING SPECIAL",
  "⚡ APPLIANCE CARNIVAL",
  "🎨 HOLI CELEBRATION",
  "✨ FESTIVE SPECIAL",
  "🏡 MEGA HOME DEALS",
];

const QUICK_GALLERY = [
  { label: "🪔 Diwali Festive", url: "/images/diwali-dhamaka-banner.jpg" },
  { label: "💍 Wedding Suite", url: "/images/hero-wedding-package.jpg" },
  { label: "⚡ Appliances Suite", url: "/images/hero-appliances-suite.jpg" },
  { label: "🛋️ Living Luxury", url: "/images/hero-living-luxury.jpg" },
  { label: "✨ Modern Hero", url: "/images/hero-desktop.webp" },
];

const initialBlank = {
  name: "",
  campaignTag: "🪔 DIWALI DHAMAKA SALE",
  title: "",
  subtitle: "",
  description: "",
  zone: "all",
  desktopImage: "/images/diwali-dhamaka-banner.jpg",
  mobileImage: "/images/diwali-dhamaka-banner.jpg",
  href: "/offers",
  ctaText: "Tap to Claim on WhatsApp",
  alt: "RF Riddhy Festival Campaign Banner",
  startsAt: "",
  endsAt: "",
  sortOrder: 1,
  active: true,
  offerCode: "DIWALI10",
  offerDescription: "Instant 10% OFF + Free Delivery & Setup in Prayagraj",
  isOfferModal: true,
};

export default function AdminCampaigns() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialBlank);
  const [editingId, setEditingId] = useState(null);
  const [previewMode, setPreviewMode] = useState("modal"); // 'modal' | 'hero'
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/cms/banners", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setItems(j.data);
        } else if (Array.isArray(j)) {
          setItems(j);
        }
      })
      .catch(() => setMessage("Unable to load banners."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const applyPreset = (preset) => {
    setForm((current) => ({
      ...current,
      name: preset.name,
      campaignTag: preset.campaignTag,
      title: preset.title,
      subtitle: preset.subtitle,
      description: preset.description,
      ctaText: preset.ctaText,
      href: preset.href,
      desktopImage: preset.desktopImage || current.desktopImage,
      mobileImage: preset.mobileImage || current.mobileImage,
      offerCode: preset.offerCode || current.offerCode,
      offerDescription: preset.offerDescription || current.offerDescription,
      zone: preset.zone || current.zone,
      isOfferModal: preset.isOfferModal !== undefined ? preset.isOfferModal : current.isOfferModal,
    }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item._id);
    setForm({
      name: item.name || "",
      campaignTag: item.campaignTag || "",
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      zone: item.zone || "all",
      desktopImage: item.desktopImage || "/images/diwali-dhamaka-banner.jpg",
      mobileImage: item.mobileImage || "",
      href: item.href || "/offers",
      ctaText: item.ctaText || "Tap to Claim on WhatsApp",
      alt: item.alt || "RF Riddhy Campaign Banner",
      startsAt: item.startsAt
        ? new Date(item.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: item.endsAt
        ? new Date(item.endsAt).toISOString().slice(0, 16)
        : "",
      sortOrder: item.sortOrder ?? 1,
      active: item.active !== false,
      offerCode: item.offerCode || "",
      offerDescription: item.offerDescription || "",
      isOfferModal: item.isOfferModal !== false,
    });
    setMessage("");
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialBlank);
    setMessage("");
  };

  const handleImageUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error?.message ||
            (typeof data?.error === "string" ? data.error : "") ||
            "Failed to upload banner image.",
        );

      update(fieldKey, data.url);
    } catch (err) {
      setMessage(`Upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (event) => {
    if (event) event.preventDefault();
    setMessage("");

    if (
      form.startsAt &&
      form.endsAt &&
      new Date(form.startsAt) > new Date(form.endsAt)
    ) {
      setMessage("Campaign end date/time must be after the start date/time.");
      return;
    }

    try {
      const payload = {
        ...form,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      };

      if (editingId) {
        payload.id = editingId;
        const response = await fetch("/api/admin/cms/banners", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error?.message || json.error || "Banner update failed.",
          );
        }

        setMessage(
          `✨ Campaign "${form.name || form.title}" updated successfully! Changes are live on the website.`,
        );
        setEditingId(null);
        setForm(initialBlank);
        load();
      } else {
        const response = await fetch("/api/admin/cms/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error?.message || json.error || "Banner was not saved.",
          );
        }

        setMessage(`✨ Campaign "${form.name || form.title}" published successfully!`);
        setForm(initialBlank);
        load();
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const toggle = async (item) => {
    try {
      const response = await fetch("/api/admin/cms/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      const json = await response.json();
      if (!json.success) setMessage(json.error?.message || "Update failed.");
      else load();
    } catch {
      setMessage("Update failed.");
    }
  };

  const deleteBanner = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this promotional banner?",
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/admin/cms/banners?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Could not delete banner.");
      }
      if (editingId === id) {
        cancelEdit();
      }
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const renderTitleFormatted = (text) => {
    if (!text) return "Diwali Dhamaka Offer";
    const words = text.trim().split(" ");
    if (words.length <= 1) return text;
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <em>{lastWord}</em>
      </>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1>Homepage Promotional Banners</h1>
          <p>
            Configure festive campaigns (Diwali, Wedding, Holi), offer popup
            modals, coupon codes, schedule launch & expiry, and preview live layouts.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "12px",
            background: "#eaf5ec",
            color: "#1b5e20",
            border: "1.5px solid #a5d6a7",
            fontSize: "13.5px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <span>{message}</span>
        </div>
      )}

      {/* =========================================================
          BANNER CREATION & EDITING FORM
          ========================================================= */}
      <form className={styles.form} onSubmit={submit}>
        {/* Top Header or Edit Command Bar */}
        {editingId ? (
          <div className={styles.editCommandBar}>
            <div className={styles.editCommandLeft}>
              <span className={styles.editLiveBadge}>
                <span className={styles.editPulseDot} />
                Editing Mode
              </span>
              <div>
                <div className={styles.editTitleText}>
                  {form.name || form.title || "Selected Banner"}
                </div>
                <div className={styles.editSubText}>
                  ID: #{String(editingId).slice(-6)} · Update fields below and save
                </div>
              </div>
            </div>

            <div className={styles.editCommandActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading Image..." : "Update Campaign Banner"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.formTopRow}>
            <h2>Create / Schedule Campaign Banner</h2>
          </div>
        )}

        {/* Festival Presets Bar */}
        <div className={styles.presetBar}>
          <span>⚡ One-Click Festive Presets:</span>
          {FESTIVAL_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.name}
              className={styles.presetBtn}
              onClick={() => applyPreset(preset)}
              title={`Load ${preset.name} presets`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* SECTION 1: CAMPAIGN IDENTITY & HEADINGS */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>📝</div>
            <div className={styles.sectionTitles}>
              <h3>1. Campaign Identity & Headlines</h3>
              <p>Configure internal reference name, eyebrow badge, main title, and promotional copy</p>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <label htmlFor="b_name">
                Campaign Internal Name *
                <span className={styles.fieldHint}>(For admin list reference)</span>
              </label>
              <input
                id="b_name"
                required
                className={styles.input}
                placeholder="e.g. Diwali Dhamaka Offer 2026"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_tag">
                Festival Tag / Eyebrow Badge
                <span className={styles.fieldHint}>(Glow badge on top)</span>
              </label>
              <input
                id="b_tag"
                className={styles.input}
                placeholder="e.g. 🪔 DIWALI DHAMAKA SALE"
                value={form.campaignTag}
                onChange={(e) => update("campaignTag", e.target.value)}
              />
              <div className={styles.quickTags}>
                {QUICK_BADGES.map((badge) => (
                  <button
                    type="button"
                    key={badge}
                    className={styles.tagChip}
                    onClick={() => update("campaignTag", badge)}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="b_title">
                Main Headline / Title *
                <span className={styles.fieldHint}>(Primary banner heading)</span>
              </label>
              <input
                id="b_title"
                required
                className={styles.input}
                placeholder="e.g. Diwali Dhamaka Offer"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_subtitle">
                Subtitle / Catchphrase
                <span className={styles.fieldHint}>(Secondary emphasis)</span>
              </label>
              <input
                id="b_subtitle"
                className={styles.input}
                placeholder="e.g. Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech"
                value={form.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.fullCol}`}>
              <label htmlFor="b_desc">
                Promotional Description
                <span className={styles.fieldHint}>(Extended offer details)</span>
              </label>
              <textarea
                id="b_desc"
                className={styles.textarea}
                placeholder="e.g. Celebrate with Up to 40% OFF + Handcrafted Teak & Smart Inverter Tech in Prayagraj..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: OFFERS, DISCOUNTS & CTA ACTION */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🎁</div>
            <div className={styles.sectionTitles}>
              <h3>2. Promotional Discounts & Customer Action</h3>
              <p>Setup coupon code, discount strip text, and direct customer action (WhatsApp or Link)</p>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <label htmlFor="b_offer_code">
                Coupon / Offer Code
                <span className={styles.fieldHint}>(Clickable copy code)</span>
              </label>
              <input
                id="b_offer_code"
                className={styles.input}
                placeholder="e.g. DIWALI10, WEDDING20, HOLI15"
                value={form.offerCode}
                onChange={(e) => update("offerCode", e.target.value.toUpperCase())}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_offer_desc">
                Offer Strip Discount Text
                <span className={styles.fieldHint}>(Visible on bottom strip)</span>
              </label>
              <input
                id="b_offer_desc"
                className={styles.input}
                placeholder="e.g. Instant 10% OFF + Free Delivery & Setup in Prayagraj"
                value={form.offerDescription}
                onChange={(e) => update("offerDescription", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_cta">
                CTA Button Text
                <span className={styles.fieldHint}>(Action button label)</span>
              </label>
              <input
                id="b_cta"
                className={styles.input}
                placeholder="e.g. Tap to Claim on WhatsApp"
                value={form.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_href">
                Destination URL / Action
                <span className={styles.fieldHint}>(WhatsApp or store link)</span>
              </label>
              <input
                id="b_href"
                className={styles.input}
                placeholder="e.g. /offers or /packages or /furniture"
                value={form.href}
                onChange={(e) => update("href", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: BANNER IMAGERY & CREATIVES */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🖼️</div>
            <div className={styles.sectionTitles}>
              <h3>3. Visual Banner Creatives & Artwork</h3>
              <p>High-resolution imagery for desktop and mobile viewports</p>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            <div className={`${styles.field} ${styles.fullCol}`}>
              <label htmlFor="b_deskImg">
                Desktop Banner Image URL *
                <span className={styles.fieldHint}>(16:9 or 1920x800 recommended)</span>
              </label>
              <div className={styles.imageInputGroup}>
                <img
                  src={form.desktopImage || "/images/diwali-dhamaka-banner.jpg"}
                  alt="Desktop Banner Preview"
                  className={styles.imagePreviewThumb}
                  onError={(e) => {
                    e.currentTarget.src = "/images/diwali-dhamaka-banner.jpg";
                  }}
                />
                <input
                  id="b_deskImg"
                  required
                  className={styles.input}
                  style={{ flex: 1 }}
                  value={form.desktopImage}
                  onChange={(e) => update("desktopImage", e.target.value)}
                  placeholder="/images/diwali-dhamaka-banner.jpg"
                />
                <button
                  type="button"
                  className={styles.uploadFileBtn}
                  onClick={() => desktopFileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Icon name="download" size={14} />
                  {uploadingImage ? "Uploading..." : "Upload File"}
                </button>
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageUpload(e, "desktopImage")}
                />
              </div>

              {/* Quick Gallery Presets */}
              <div className={styles.quickGallery}>
                <span>Quick Library:</span>
                {QUICK_GALLERY.map((g) => (
                  <button
                    type="button"
                    key={g.label}
                    className={styles.galleryChip}
                    onClick={() => update("desktopImage", g.url)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${styles.field} ${styles.fullCol}`}>
              <label htmlFor="b_mobImg">
                Mobile Banner Image URL (Optional)
                <span className={styles.fieldHint}>(Vertical or cropped mobile version)</span>
              </label>
              <div className={styles.imageInputGroup}>
                <input
                  id="b_mobImg"
                  className={styles.input}
                  style={{ flex: 1 }}
                  value={form.mobileImage}
                  onChange={(e) => update("mobileImage", e.target.value)}
                  placeholder="Optional: /images/banner-mobile.webp"
                />
                <button
                  type="button"
                  className={styles.uploadFileBtn}
                  onClick={() => mobileFileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Icon name="download" size={14} />
                  Upload Mobile
                </button>
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageUpload(e, "mobileImage")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PLACEMENT & SCHEDULING */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>⚙️</div>
            <div className={styles.sectionTitles}>
              <h3>4. Placement, Scheduling & Visibility</h3>
              <p>Control where this campaign is displayed and schedule automatic launch or expiry</p>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            <div className={`${styles.field} ${styles.fullCol}`}>
              <label>Banner Placement Zone</label>
              <div className={styles.pillSelector}>
                <div
                  className={`${styles.zonePill} ${
                    form.zone === "all" ? styles.activePill : ""
                  }`}
                  onClick={() => update("zone", "all")}
                >
                  <b>🌟 Both Carousel & Modal</b>
                  <span>Hero carousel + Promotional pop-up modal</span>
                </div>

                <div
                  className={`${styles.zonePill} ${
                    form.zone === "offers-modal" ? styles.activePill : ""
                  }`}
                  onClick={() => update("zone", "offers-modal")}
                >
                  <b>📱 Offer Pop-up Modal Only</b>
                  <span>Displays exclusively in store popup modal</span>
                </div>

                <div
                  className={`${styles.zonePill} ${
                    form.zone === "home-hero" ? styles.activePill : ""
                  }`}
                  onClick={() => update("zone", "home-hero")}
                >
                  <b>🖥️ Homepage Hero Only</b>
                  <span>Rotates in the top homepage carousel</span>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="b_sort">Sort Order (Lower numbers appear first)</label>
              <input
                id="b_sort"
                type="number"
                className={styles.input}
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", Number(e.target.value))}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_starts">Start Date / Time (Schedule launch)</label>
              <input
                id="b_starts"
                type="datetime-local"
                className={styles.input}
                value={form.startsAt}
                max={form.endsAt || undefined}
                onChange={(e) => update("startsAt", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="b_ends">End Date / Time (Auto-expiry)</label>
              <input
                id="b_ends"
                type="datetime-local"
                className={styles.input}
                value={form.endsAt}
                min={form.startsAt || undefined}
                onChange={(e) => update("endsAt", e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.fullCol}`}>
              <div className={styles.switchRow}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => update("active", e.target.checked)}
                  />
                  <span>Active & Published on Website</span>
                </label>

                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={form.isOfferModal}
                    onChange={(e) => update("isOfferModal", e.target.checked)}
                  />
                  <span>Show in Promotional Offers Pop-up Modal</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            LIVE DUAL-MODE PREVIEW
            ========================================================= */}
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <span className={styles.previewHeaderTitle}>
              <Icon name="sparkles" size={15} color="#d4af37" />
              Live Interactive Preview
            </span>
            <div className={styles.previewTabs}>
              <button
                type="button"
                className={`${styles.previewTabBtn} ${
                  previewMode === "modal" ? styles.activeTab : ""
                }`}
                onClick={() => setPreviewMode("modal")}
              >
                📱 Offer Pop-up Modal View
              </button>
              <button
                type="button"
                className={`${styles.previewTabBtn} ${
                  previewMode === "hero" ? styles.activeTab : ""
                }`}
                onClick={() => setPreviewMode("hero")}
              >
                🖥️ Homepage Hero Slide View
              </button>
            </div>
          </div>

          {/* Modal Mockup Preview */}
          {previewMode === "modal" ? (
            <div className={styles.modalPreviewBox}>
              <div className={styles.mockupModalCard}>
                <div
                  className={styles.mockupImageHero}
                  style={{
                    backgroundImage: `url('${form.desktopImage || "/images/diwali-dhamaka-banner.jpg"}')`,
                  }}
                >
                  <div className={styles.mockupOverlay} />

                  {form.campaignTag && (
                    <div className={styles.mockupTopBadge}>
                      <span>🪔</span>
                      <span>{form.campaignTag}</span>
                    </div>
                  )}

                  <div className={styles.mockupContentBottom}>
                    <h4 className={styles.mockupTitle}>
                      {renderTitleFormatted(form.title)}
                    </h4>
                    <p className={styles.mockupSubtitle}>
                      {form.subtitle || "Celebrate with exclusive handcrafted teak & smart appliances"}
                    </p>

                    <div className={styles.mockupWaPill}>
                      <Icon name="whatsapp" size={14} color="#ffffff" />
                      <span>{form.ctaText || "Tap to Claim on WhatsApp"}</span>
                      <Icon name="arrowRight" size={12} color="#ffffff" />
                    </div>
                  </div>
                </div>

                {/* Bottom Strip Mockup */}
                <div className={styles.mockupCodeStrip}>
                  <div className={styles.mockupStripLeft}>
                    <Icon name="sparkles" size={15} color="#f7cb7a" />
                    <div>
                      <div className={styles.mockupStripLabel}>
                        {form.campaignTag
                          ? form.campaignTag.replace(/^[^\w\s]+/, "").trim()
                          : "SPECIAL OFFER CODE"}
                      </div>
                      <div className={styles.mockupStripDesc}>
                        {form.offerDescription || "Instant 10% OFF + Free Delivery & Setup in Prayagraj"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.mockupCodePill}>
                    {form.offerCode || "DIWALI10"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Hero Slide Mockup Preview */
            <div
              className={styles.heroSlidePreview}
              style={{
                backgroundImage: `url('${form.desktopImage || "/images/diwali-dhamaka-banner.jpg"}')`,
              }}
            >
              <div className={styles.heroSlideOverlay} />
              <div className={styles.heroSlideContent}>
                {form.campaignTag && (
                  <span className={styles.heroSlideBadge}>{form.campaignTag}</span>
                )}
                <h3 className={styles.heroSlideTitle}>
                  {form.title || "Your Campaign Headline"}
                </h3>
                <p className={styles.heroSlideDesc}>
                  {form.subtitle || form.description || "Celebrate with handcrafted teak craftsmanship and appliances."}
                </p>
                <div className={styles.heroSlideCta}>
                  <span>{form.ctaText || "Explore Now"}</span>
                  <Icon name="arrowRight" size={13} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FORM ACTIONS */}
        <div className={styles.formBottomActions}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={uploadingImage}
            >
              <Icon name="check" size={16} />
              {uploadingImage
                ? "Uploading Image..."
                : editingId
                ? "Update Campaign Banner"
                : "Publish / Schedule Banner"}
            </button>

            {editingId && (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <small style={{ color: "#7b857d", fontSize: "12px" }}>
            * Changes save directly to MongoDB and reflect immediately on the website.
          </small>
        </div>
      </form>

      {/* =========================================================
          CURRENT PROMOTIONAL SLIDES LIST
          ========================================================= */}
      <div>
        <h2
          style={{
            font: "500 22px var(--font-display)",
            color: "var(--rf-forest-deep, #11261b)",
            margin: "0 0 16px",
          }}
        >
          Current Promotional Slides ({items.length})
        </h2>

        <div className={styles.list}>
          {items.map((item) => (
            <article key={item.id} className={styles.bannerCard}>
              <img
                src={item.desktopImage || "/images/diwali-dhamaka-banner.jpg"}
                alt={item.title || item.name}
                className={styles.bannerThumb}
                onError={(e) => {
                  e.currentTarget.src = "/images/diwali-dhamaka-banner.jpg";
                }}
              />

              <div className={styles.bannerDetails}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <b>{item.title || item.name}</b>
                  {item.campaignTag && (
                    <span
                      style={{
                        fontSize: "10.5px",
                        background: "var(--rf-cream-100, #f2efe9)",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontWeight: 800,
                        color: "var(--rf-gold-700, #b78103)",
                      }}
                    >
                      {item.campaignTag}
                    </span>
                  )}
                  {item.offerCode && (
                    <span className={styles.offerCodeBadge}>
                      🏷️ {item.offerCode}
                    </span>
                  )}
                  <span className={styles.zoneBadge}>
                    {item.zone === "offers-modal"
                      ? "Modal Only"
                      : item.zone === "home-hero"
                      ? "Hero Only"
                      : "Hero + Modal"}
                  </span>
                </div>
                <span>{item.subtitle || item.description || item.href}</span>
                <small>
                  Order #{item.sortOrder || 1} ·{" "}
                  {item.startsAt
                    ? `From ${new Date(item.startsAt).toLocaleDateString("en-IN")}`
                    : "Immediate"}{" "}
                  {item.endsAt
                    ? `Until ${new Date(item.endsAt).toLocaleDateString("en-IN")}`
                    : "Indefinite"}{" "}
                  · Action: {item.ctaText || "Explore"} ({item.href || "/offers"})
                </small>
              </div>

              <span className={item.active ? styles.published : styles.paused}>
                {item.active ? "Active" : "Paused"}
              </span>

              <div className={styles.actionBtns}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleEdit(item)}
                  title="Edit this banner's content, coupon code, and imagery"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => toggle(item)}
                >
                  {item.active ? "Pause" : "Activate"}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteBanner(item.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!items.length && !loading && (
            <div className={styles.empty}>
              No scheduled banners currently loaded. Fill the form above to
              launch your first festival campaign!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
