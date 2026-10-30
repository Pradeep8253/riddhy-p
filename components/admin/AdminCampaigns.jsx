'use client';

import { useEffect, useState, useRef } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './AdminCampaigns.module.css';

const ZONES = [
  {
    id: 'hero-slider',
    label: 'Hero Left Slider',
    badge: 'Left Slider',
    description: 'Main rotating carousel slider on the left side of homepage.',
    recommended: 'Recommended: 1200 × 750px (Landscape)',
  },
  {
    id: 'hero-side-top',
    label: 'Hero Right Top',
    badge: 'Right Top Card',
    description: 'Top promotional card on the right side next to slider.',
    recommended: 'Recommended: 800 × 440px (Wide)',
  },
  {
    id: 'hero-side-bottom',
    label: 'Hero Right Bottom',
    badge: 'Right Bottom Card',
    description: 'Bottom promotional card on the right side next to slider.',
    recommended: 'Recommended: 800 × 440px (Wide)',
  },
  {
    id: 'popupbanner',
    label: 'Popup Banner',
    badge: 'Popup Banner',
    description: 'Image shown in the website popup. Only image and active status are managed here.',
    recommended: 'Recommended: landscape image',
  },
];

const QUICK_LINKS = [
  { label: '📦 Packages', href: '/packages' },
  { label: '🔥 Offers', href: '/offers' },
  { label: '🛍️ All Products', href: '/products' },
  { label: '🛋️ Furniture', href: '/furniture' },
  { label: '⚡ Appliances', href: '/appliances' },
];

const initialBlank = {
  title: '',
  zone: 'hero-slider',
  desktopImage: '',
  href: '/packages',
  sortOrder: 1,
  active: true,
};

export default function AdminCampaigns() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialBlank);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterZone, setFilterZone] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(true);

  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/cms/banners', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setItems(j.data);
        } else if (Array.isArray(j)) {
          setItems(j);
        }
      })
      .catch(() => setMessage('Unable to load banners.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    const zone = filterZone === 'popupbanner' ? 'popupbanner' : initialBlank.zone;
    setForm({ ...initialBlank, zone });
    setShowZonePicker(zone !== 'popupbanner');
    setMessage('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item._id);
    setForm({
      title: item.title || item.name || '',
      zone: item.zone || 'hero-slider',
      desktopImage: item.desktopImage || item.mobileImage || '',
      href: item.href || '/packages',
      sortOrder: item.sortOrder ?? 1,
      active: item.active !== false,
    });
    setShowZonePicker(item.zone !== 'popupbanner');
    setMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialBlank);
    setShowZonePicker(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');
      if (form.title) {
        formData.append('productName', form.title);
        formData.append('alt', form.title);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.error || 'Failed to upload image.');
      }

      const finalUrl = data.data?.url || data.url;
      update('desktopImage', finalUrl);
      setMessage('✅ Image uploaded successfully!');
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (event) => {
    if (event) event.preventDefault();
    setMessage('');

    if (!form.desktopImage) {
      setMessage('Please upload or provide an image URL for the banner.');
      return;
    }

    try {
      const payload = {
        name: form.zone === 'popupbanner' ? 'Popup Banner' : (form.title || 'Homepage Banner'),
        title: form.zone === 'popupbanner' ? 'Popup Banner' : (form.title || 'Homepage Banner'),
        zone: form.zone,
        desktopImage: form.desktopImage,
        mobileImage: form.desktopImage,
        href: form.href || '/packages',
        active: form.active !== false,
        sortOrder: Number(form.sortOrder) || 1,
        alt: form.title || 'RF Riddhy Promotional Banner',
      };

      if (editingId) {
        payload.id = editingId;
        const response = await fetch('/api/admin/cms/banners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error?.message || json.error || 'Banner update failed.');
        }

        setMessage(`✨ Banner "${form.title}" updated successfully!`);
        closeModal();
        load();
      } else {
        const response = await fetch('/api/admin/cms/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error?.message || json.error || 'Banner creation failed.');
        }

        setMessage(`✨ Banner "${form.title}" published successfully!`);
        closeModal();
        load();
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const toggle = async (item) => {
    try {
      const id = item.id || item._id;
      const newActive = item.active === false ? true : false;
      const response = await fetch('/api/admin/cms/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: newActive }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to update status.');
      }
      load();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this banner?')) return;
    try {
      const response = await fetch(`/api/admin/cms/banners?id=${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete banner.');
      }
      load();
      setMessage('Banner deleted.');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterZone === 'all') return true;
    return item.zone === filterZone;
  });

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.head}>
        <div>
          <h1>Homepage Promotional Banners</h1>
          <p>
            RF Riddhy Homepage Banner Manager: Manage images directly for the
            <strong> Left Main Slider</strong>, <strong>Right Top Card</strong>, and{' '}
            <strong>Right Bottom Card</strong>.
          </p>
        </div>
        <button type="button" className={styles.topAddBtn} onClick={openCreateModal}>
          ➕ Add New Banner
        </button>
      </div>

      {message && (
        <div
          className={`${styles.notification} ${
            message.includes('❌') ? styles.errorNotice : styles.successNotice
          }`}
        >
          {message}
        </div>
      )}

      {/* BANNER LIST TABLE / CARDS */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <div>
            <h2>Current Banners ({items.length})</h2>
            <p>Manage, toggle on/off, edit, or delete existing promotional banners.</p>
          </div>

          {/* Filter Zone */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterZone === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterZone('all')}
            >
              All Zones ({items.length})
            </button>
            {ZONES.map((zone) => (
              <button key={zone.id} type="button"
                className={`${styles.filterBtn} ${filterZone === zone.id ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterZone(zone.id)}>{zone.badge}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>Loading banners...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyBox}>No banners found for this zone.</div>
        ) : (
          <div className={styles.bannerGrid}>
            {filteredItems.map((item) => {
              const zoneMeta = ZONES.find((z) => z.id === item.zone);
              return (
                <div
                  key={item.id || item._id}
                  className={`${styles.bannerCard} ${
                    item.active === false ? styles.bannerCardInactive : ''
                  }`}
                >
                  <div className={styles.cardImgWrap}>
                    <img
                      src={item.desktopImage || item.mobileImage}
                      alt={item.title || item.name}
                      className={styles.cardImg}
                    />
                    <span className={styles.cardZoneBadge}>
                      {zoneMeta ? zoneMeta.badge : item.zone}
                    </span>
                    <button
                      type="button"
                      className={`${styles.statusPill} ${
                        item.active !== false ? styles.statusPillActive : styles.statusPillInactive
                      }`}
                      onClick={() => toggle(item)}
                      title="Click to toggle Active status"
                    >
                      {item.active !== false ? 'Live' : 'Hidden'}
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>{item.zone === 'popupbanner' ? 'Popup Banner' : (item.title || item.name)}</div>
                    {item.zone !== 'popupbanner' && <div className={styles.cardHref}>
                      <span className={styles.hrefTag}>Target:</span> {item.href || '/packages'}
                    </div>}

                    <div className={styles.cardFooter}>
                      <span className={styles.sortBadge}>Order #{item.sortOrder ?? 1}</span>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => handleEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => remove(item.id || item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DEDICATED SEPARATE MODAL POPUP FOR ADDING & EDITING BANNERS */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2>{form.zone === 'popupbanner' ? 'Popup Banner Image' : (editingId ? '✏️ Edit Banner' : '➕ Upload New Banner Image')}</h2>
                <span className={styles.modalSub}>
                  {form.zone === 'popupbanner' ? 'This image appears in the website popup.' : (editingId ? `Editing: ${form.title || 'Banner'}` : 'Configure and upload banner image for homepage')}
                </span>
              </div>
              <button type="button" className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={submit} className={styles.modalForm}>
              <div className={styles.modalBody}>
                {showZonePicker && <div className={styles.fieldSection}>
                  <label className={styles.sectionLabel}>
                    1. Placement Zone <span className={styles.req}>*</span>
                  </label>
                  <div className={styles.zoneGrid}>
                    {ZONES.map((z) => (
                      <div
                        key={z.id}
                        className={`${styles.zoneCard} ${form.zone === z.id ? styles.zoneCardActive : ''}`}
                        onClick={() => {
                          update('zone', z.id);
                          setShowZonePicker(z.id !== 'popupbanner');
                        }}
                      >
                        <div className={styles.zoneCardHead}>
                          <input
                            type="radio"
                            name="zone"
                            checked={form.zone === z.id}
                            onChange={() => {
                              update('zone', z.id);
                              setShowZonePicker(z.id !== 'popupbanner');
                            }}
                          />
                          <span className={styles.zoneBadge}>{z.badge}</span>
                        </div>
                        <div className={styles.zoneName}>{z.label}</div>
                        <div className={styles.zoneDesc}>{z.description}</div>
                        <div className={styles.zoneRec}>{z.recommended}</div>
                      </div>
                    ))}
                  </div>
                </div>}

                {form.zone === 'popupbanner' && !showZonePicker && (
                  <div className={styles.popupNote}>
                    <span className={styles.popupNoteIcon}>✦</span>
                    <span><strong>Popup banner</strong><small>One image, shown in the center of the storefront.</small></span>
                    <button type="button" onClick={() => setShowZonePicker(true)}>Change placement</button>
                  </div>
                )}

                {/* 2. IMAGE UPLOAD & PREVIEW */}
                <div className={styles.fieldSection}>
                  <label className={styles.sectionLabel}>
                    {form.zone === 'popupbanner' ? 'Popup image' : '2. Banner Image'} <span className={styles.req}>*</span>
                  </label>

                  <div className={`${styles.uploadContainer} ${form.zone === 'popupbanner' ? styles.uploadContainerPopup : ''}`}>
                    {/* Direct Upload Box */}
                    <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <Icon name="upload" size={32} />
                      <div className={styles.dropZoneText}>
                        <strong>Click to Upload Image</strong> or drag and drop
                      </div>
                      <div className={styles.dropZoneSub}>PNG, JPG, WEBP up to 5MB</div>
                      {uploadingImage && <div className={styles.uploadingNotice}>Uploading image... Please wait</div>}
                    </div>

                    {/* URL Input */}
                    <div className={styles.urlInputRow}>
                      <span className={styles.orText}>OR Enter Image URL:</span>
                      <input
                        type="text"
                        placeholder="https://... or /images/banners/..."
                        value={form.desktopImage}
                        onChange={(e) => update('desktopImage', e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    {/* Live Preview of Selected Image */}
                    {(form.desktopImage || form.zone === 'popupbanner') && (
                      <div className={`${styles.previewBox} ${form.zone === 'popupbanner' ? styles.popupPreviewBox : ''}`}>
                        <div className={styles.previewBoxHead}>
                          <span>Image Preview</span>
                          {form.desktopImage && <a href={form.desktopImage} target="_blank" rel="noreferrer" className={styles.previewLink}>
                            View Full Image ↗
                          </a>}
                        </div>
                        {form.desktopImage ? <div className={styles.previewImgWrap}>
                          <img
                            src={form.desktopImage}
                            alt="Banner preview"
                            className={styles.previewImg}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div> : <div className={styles.previewEmpty}><span>✦</span><strong>Image preview</strong><small>Your popup image will appear here</small></div>}
                      </div>
                    )}
                  </div>
                </div>

                {form.zone !== 'popupbanner' && <>
                {/* 3. TITLE & LINK DETAILS */}
                <div className={styles.fieldSection}>
                  <label className={styles.sectionLabel}>3. Banner Details</label>
                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>
                        Banner Title / Name <span className={styles.req}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Festival Offer / New Season Launch"
                        value={form.title}
                        onChange={(e) => update('title', e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.hint}>Used for reference and accessibility.</span>
                    </div>

                    <div>
                      <label className={styles.label}>
                        Click Destination (Href URL) <span className={styles.req}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. /packages or /offers"
                        value={form.href}
                        onChange={(e) => update('href', e.target.value)}
                        className={styles.input}
                      />
                      {/* Quick links */}
                      <div className={styles.quickLinks}>
                        {QUICK_LINKS.map((ql, i) => (
                          <button
                            key={i}
                            type="button"
                            className={styles.quickLinkChip}
                            onClick={() => update('href', ql.href)}
                          >
                            {ql.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.grid2} style={{ marginTop: '14px' }}>
                    <div>
                      <label className={styles.label}>Display Order in Slider</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={form.sortOrder}
                        onChange={(e) => update('sortOrder', e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.hint}>Lower number appears first (1, 2, 3...).</span>
                    </div>

                    <div>
                      <label className={styles.label}>Active Status</label>
                      <div className={styles.toggleRow}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => update('active', e.target.checked)}
                          />
                          <span className={styles.slider} />
                        </label>
                        <span className={form.active ? styles.statusActive : styles.statusInactive}>
                          {form.active ? '🟢 Live on Website' : '⚪ Hidden (Draft)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </>}
              </div>
              {/* Modal Footer Actions */}
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={uploadingImage}>
                  {editingId ? '✓ Save Changes' : '➕ Upload & Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

