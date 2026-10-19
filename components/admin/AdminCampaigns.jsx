"use client";

import { useEffect, useState } from "react";
import { IMG } from "@/lib/images";
import Icon from "@/components/ui/Icon";
import styles from "./AdminCampaigns.module.css";

const FESTIVAL_PRESETS = [
  {
    name: "Diwali Mega Utsav",
    campaignTag: "✨ DIWALI FESTIVE UTSAV",
    title: "Celebrate Light, Craft & Comfort",
    subtitle: "Up to 40% Off Handcrafted Living & Dining",
    description:
      "Bring timeless Sheesham elegance to your home this Diwali with complimentary delivery & setup.",
    ctaText: "Explore Diwali Offers",
    href: "/furniture",
  },
  {
    name: "Royal Wedding Season",
    campaignTag: "💍 WEDDING SEASON SPECIAL",
    title: "Complete Marriage & Home Packages",
    subtitle: "Thoughtfully curated bedroom, hall & appliance sets",
    description:
      "Customizable packages from ₹99,999 with 5-year structural warranty & priority delivery scheduling.",
    ctaText: "View Marriage Packages",
    href: "/packages",
  },
  {
    name: "Holi Home Refresh",
    campaignTag: "🎨 HOLI CELEBRATION CARNIVAL",
    title: "Vibrant Colors for Thoughtful Spaces",
    subtitle: "Stain-resistant upholstery & solid wood masterpieces",
    description:
      "Refresh your living space with festive savings on premium sofas, recliners, and smart appliances.",
    ctaText: "Shop the Collection",
    href: "/rooms/living",
  },
  {
    name: "Summer Appliance Carnival",
    campaignTag: "⚡ APPLIANCE CARNIVAL",
    title: "Smart Inverter Air & Cold Storage",
    subtitle: "Convertible Refrigerators & 5-Star Air Coolers",
    description:
      "Certified energy-saving appliances with official brand warranties and certified home installation.",
    ctaText: "Shop Appliances",
    href: "/appliances",
  },
];

const initialBlank = {
  name: "",
  campaignTag: "✨ FESTIVAL SPECIAL",
  title: "",
  subtitle: "",
  description: "",
  zone: "home-hero",
  desktopImage: IMG.hero?.desktop || "/hero-desktop.webp",
  mobileImage: IMG.hero?.mobile || "/hero-mobile.webp",
  href: "/packages",
  ctaText: "Explore Now",
  alt: "RF Riddhy Festival Campaign Banner",
  startsAt: "",
  endsAt: "",
  sortOrder: 1,
  active: true,
};

export default function AdminCampaigns() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialBlank);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    }));
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
    event.preventDefault();
    setMessage("");

    if (form.startsAt && form.endsAt && new Date(form.startsAt) > new Date(form.endsAt)) {
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

      setMessage(`Campaign "${form.name}" published successfully!`);
      setForm(initialBlank);
      load();
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
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1>Homepage Promotional Banners</h1>
          <p>
            Flipkart-style festival carousel for the homepage. Configure festive
            campaigns (Diwali, Wedding, Holi), schedule launch & expiry, and
            preview live layouts.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            background: "#eaf5ec",
            color: "#1b5e20",
            border: "1px solid #c8e6c9",
            fontSize: "13px",
          }}
        >
          {message}
        </div>
      )}

      {/* BANNER CREATION FORM */}
      <form className={styles.form} onSubmit={submit}>
        <h2>Create / Schedule Campaign Banner</h2>

        {/* Quick Presets */}
        <div className={styles.presetBar}>
          <span>Festival Presets:</span>
          {FESTIVAL_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.name}
              className={styles.presetBtn}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="b_name">Campaign Internal Name *</label>
            <input
              id="b_name"
              required
              className={styles.input}
              placeholder="e.g. Diwali Mega Utsav 2026"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_tag">Festival Tag / Eyebrow Badge</label>
            <input
              id="b_tag"
              className={styles.input}
              placeholder="e.g. 💍 WEDDING SEASON SPECIAL or ✨ DIWALI SALE"
              value={form.campaignTag}
              onChange={(e) => update("campaignTag", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_title">Main Headline / Title *</label>
            <input
              id="b_title"
              required
              className={styles.input}
              placeholder="e.g. Marriage & Home Packages"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_subtitle">Subtitle / Catchphrase</label>
            <input
              id="b_subtitle"
              className={styles.input}
              placeholder="e.g. Everything for your new beginning"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label htmlFor="b_desc">Promotional Description</label>
            <textarea
              id="b_desc"
              className={styles.textarea}
              placeholder="e.g. Up to 35% savings on complete 1BHK, 2BHK & luxury bedroom suites..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_cta">CTA Button Text</label>
            <input
              id="b_cta"
              className={styles.input}
              placeholder="e.g. Explore Packages"
              value={form.ctaText}
              onChange={(e) => update("ctaText", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_href">Destination URL / Page</label>
            <input
              id="b_href"
              className={styles.input}
              placeholder="e.g. /packages or /furniture"
              value={form.href}
              onChange={(e) => update("href", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_deskImg">Desktop Banner Image URL</label>
            <input
              id="b_deskImg"
              required
              className={styles.input}
              value={form.desktopImage}
              onChange={(e) => update("desktopImage", e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              style={{ fontSize: "11px", marginTop: "4px" }}
              onChange={(e) => handleImageUpload(e, "desktopImage")}
              disabled={uploadingImage}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_mobImg">Mobile Banner Image URL (Optional)</label>
            <input
              id="b_mobImg"
              className={styles.input}
              value={form.mobileImage}
              onChange={(e) => update("mobileImage", e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              style={{ fontSize: "11px", marginTop: "4px" }}
              onChange={(e) => handleImageUpload(e, "mobileImage")}
              disabled={uploadingImage}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="b_starts">Start Date / Time (Schedule)</label>
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

          <div className={styles.field}>
            <label htmlFor="b_sort">Sort Order (Lower appears first)</label>
            <input
              id="b_sort"
              type="number"
              className={styles.input}
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </div>
        </div>

        {/* LIVE MOCKUP PREVIEW */}
        <div className={styles.previewBox}>
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "#eedab7",
              marginBottom: "8px",
              letterSpacing: "0.08em",
            }}
          >
            Live Banner Slide Preview:
          </div>
          {form.campaignTag && (
            <span className={styles.previewBadge}>{form.campaignTag}</span>
          )}
          <div className={styles.previewTitle}>
            {form.title || "Your Campaign Headline"}
          </div>
          {form.subtitle && (
            <div className={styles.previewSub}>{form.subtitle}</div>
          )}
          {form.description && (
            <div className={styles.previewDesc}>{form.description}</div>
          )}
          <span
            className={styles.previewCta}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {form.ctaText || "Explore Now"} <Icon name="arrow" size={14} />
          </span>
        </div>

        <label className={styles.activeCheckbox}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
          />
          Active & Ready to Publish on Homepage Carousel
        </label>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={uploadingImage}
        >
          {uploadingImage ? "Uploading Image..." : "Publish / Schedule Banner"}
        </button>
      </form>

      {/* EXISTING BANNERS LIST */}
      <div>
        <h2
          style={{
            font: "500 22px var(--font-display)",
            color: "var(--rf-forest-deep)",
            margin: "0 0 16px",
          }}
        >
          Current Promotional Slides ({items.length})
        </h2>

        <div className={styles.list}>
          {items.map((item) => (
            <article key={item.id} className={styles.bannerCard}>
              <div className={styles.bannerDetails}>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <b>{item.title || item.name}</b>
                  {item.campaignTag && (
                    <span
                      style={{
                        fontSize: "10px",
                        background: "var(--rf-cream-100)",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontWeight: 800,
                        color: "var(--rf-gold-700)",
                      }}
                    >
                      {item.campaignTag}
                    </span>
                  )}
                </div>
                <span>{item.subtitle || item.description || item.href}</span>
                <small>
                  Order #{item.sortOrder || 1} ·{" "}
                  {item.startsAt
                    ? `From ${new Date(item.startsAt).toLocaleDateString("en-IN")}`
                    : "Immediate"}{" "}
                  {item.endsAt
                    ? `Until ${new Date(item.endsAt).toLocaleDateString("en-IN")}`
                    : "Indefinite"}
                </small>
              </div>

              <span className={item.active ? styles.published : styles.paused}>
                {item.active ? "Active" : "Paused"}
              </span>

              <div className={styles.actionBtns}>
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
