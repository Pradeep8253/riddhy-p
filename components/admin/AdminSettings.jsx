'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './AdminSettings.module.css';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('care');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [source, setSource] = useState('database');

  const [formData, setFormData] = useState({
    contact: {
      phone: '',
      whatsapp: '',
      email: '',
      responseTime: '',
      hours: '',
      holidaysNotice: ''
    },
    showroom: {
      name: '',
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mapUrl: '',
      hours: ''
    },
    consultation: {
      capacityPerSlot: 3,
      homeVisit: false
    },
    story: {
      foundedYear: '',
      originCity: '',
      founderNarrative: '',
      metrics: {
        homesFurnished: '',
        pincodesServed: '',
        satisfactionRate: ''
      },
      partnerBrands: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data.settings || data.data;
        setSource(data.data?.source || data.source || 'database');
        setFormData({
          contact: {
            phone: d.contact?.phone || '',
            whatsapp: d.contact?.whatsapp || '',
            email: d.contact?.email || '',
            responseTime: d.contact?.responseTime || '',
            hours: d.contact?.hours || '',
            holidaysNotice: d.contact?.holidaysNotice || ''
          },
          showroom: {
            name: d.showroom?.name || '',
            addressLine1: d.showroom?.addressLine1 || '',
            city: d.showroom?.city || '',
            state: d.showroom?.state || '',
            pincode: d.showroom?.pincode || '',
            country: d.showroom?.country || 'India',
            mapUrl: d.showroom?.mapUrl || '',
            hours: d.showroom?.hours || ''
          },
          consultation: {
            capacityPerSlot: d.consultation?.capacityPerSlot ?? 3,
            homeVisit: Boolean(d.consultation?.modes?.home ?? d.consultation?.homeVisit)
          },
          story: {
            foundedYear: d.story?.foundedYear || '',
            originCity: d.story?.originCity || '',
            founderNarrative: d.story?.founderNarrative || '',
            metrics: {
              homesFurnished: d.story?.metrics?.homesFurnished || '',
              pincodesServed: d.story?.metrics?.pincodesServed || '',
              satisfactionRate: d.story?.metrics?.satisfactionRate || ''
            },
            partnerBrands: Array.isArray(d.story?.partnerBrands)
              ? d.story.partnerBrands.join(', ')
              : d.story?.partnerBrands || ''
          }
        });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load store settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  const handleShowroomChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      showroom: { ...prev.showroom, [field]: val }
    }));
  };

  const handleConsultationChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      consultation: { ...prev.consultation, [field]: val }
    }));
  };

  const handleStoryChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      story: { ...prev.story, [field]: val }
    }));
  };

  const handleMetricChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        metrics: { ...prev.story.metrics, [field]: val }
      }
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setToast(null);

    const payload = {
      contact: formData.contact,
      showroom: formData.showroom,
      consultation: formData.consultation,
      story: {
        ...formData.story,
        partnerBrands: formData.story.partnerBrands
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean)
      }
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSource('database');
        setToast({ type: 'success', message: 'Settings saved and published successfully.' });
      } else {
        setToast({ type: 'error', message: data.error?.message || 'Failed to save settings.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network or database error while saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const hasConfig = (val) => Boolean(val && String(val).trim().length > 0);

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <div className={styles.head}>
        <div>
          <span className="kicker">Store Operations · Business Truth</span>
          <h1>Store Settings & Brand Proof</h1>
          <p>
            Configure customer care channels, showroom hours & address, consultation booking rules,
            and brand story proof. Values update immediately across the store.
          </p>
        </div>

        <div
          className={`${styles.statusBadge} ${
            source === 'database' ? styles.badgeDb : styles.badgeEnv
          }`}
        >
          <span className={styles.statusDot} />
          <span>
            {source === 'database'
              ? 'Stored in Database'
              : 'System Preset Defaults'}
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`${styles.alert} ${
            toast.type === 'success'
              ? styles.alertSuccess
              : toast.type === 'warning'
              ? styles.alertWarning
              : styles.alertError
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Settings categories">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'care' ? styles.active : ''}`}
          onClick={() => setActiveTab('care')}
        >
          Customer Care
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'showroom' ? styles.active : ''}`}
          onClick={() => setActiveTab('showroom')}
        >
          Showroom & Hours
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'consultation' ? styles.active : ''}`}
          onClick={() => setActiveTab('consultation')}
        >
          Consultation Rules
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'story' ? styles.active : ''}`}
          onClick={() => setActiveTab('story')}
        >
          Brand Proof & Story
        </button>
      </nav>

      {/* Tab 1: Customer Care */}
      {activeTab === 'care' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Customer Care Channels</h2>
            <p>
              Leave any channel blank to automatically hide that contact option from the store.
              Do not enter mock or unverified numbers.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Support Phone Number</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. +91 99342 08035"
                value={formData.contact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
              />
              <span className={styles.hint}>Shown on Header, Footer, and Contact page.</span>
            </div>

            <div className={styles.field}>
              <label>WhatsApp Business Number</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 919934208035 (with country code)"
                value={formData.contact.whatsapp}
                onChange={(e) => handleContactChange('whatsapp', e.target.value)}
              />
              <span className={styles.hint}>Generates direct wa.me chat links across the site.</span>
            </div>

            <div className={styles.field}>
              <label>Support Email Address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="e.g. care@riddhy.in"
                value={formData.contact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
              />
              <span className={styles.hint}>Official customer care inquiries desk.</span>
            </div>

            <div className={styles.field}>
              <label>Response Expectation</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 4 working hours or 24 hours"
                value={formData.contact.responseTime}
                onChange={(e) => handleContactChange('responseTime', e.target.value)}
              />
              <span className={styles.hint}>Displayed on Contact Page response badge.</span>
            </div>

            <div className={styles.field}>
              <label>Store / Care Operating Hours</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Mon – Sat: 10:00 AM – 7:30 PM"
                value={formData.contact.hours}
                onChange={(e) => handleContactChange('hours', e.target.value)}
              />
              <span className={styles.hint}>Weekly customer care schedule.</span>
            </div>

            <div className={styles.field}>
              <label>Holidays / Days Off Notice</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Closed on national holidays and Sundays"
                value={formData.contact.holidaysNotice}
                onChange={(e) => handleContactChange('holidaysNotice', e.target.value)}
              />
              <span className={styles.hint}>Displayed alongside operating hours.</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Showroom & Location */}
      {activeTab === 'showroom' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Experience Showroom & Address</h2>
            <p>
              When an address is set, it appears on the Contact page, in the showroom visit mode for
              consultations, and in the site schema.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Showroom Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. RF Riddhy Experience Store"
                value={formData.showroom.name}
                onChange={(e) => handleShowroomChange('name', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Street Address Line</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Plot 42, Sector 18, Design District"
                value={formData.showroom.addressLine1}
                onChange={(e) => handleShowroomChange('addressLine1', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Gurugram / New Delhi / Patna"
                value={formData.showroom.city}
                onChange={(e) => handleShowroomChange('city', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>State</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Haryana / Delhi / Bihar"
                value={formData.showroom.state}
                onChange={(e) => handleShowroomChange('state', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Pincode</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 122002"
                value={formData.showroom.pincode}
                onChange={(e) => handleShowroomChange('pincode', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Google Maps Direction URL</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://maps.google.com/?q=..."
                value={formData.showroom.mapUrl}
                onChange={(e) => handleShowroomChange('mapUrl', e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Consultation Rules */}
      {activeTab === 'consultation' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Consultation Capacity & Rules</h2>
            <p>
              Control how many bookings each time window (Morning, Afternoon, Evening) can accept
              before marking the slot as fully booked.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Capacity Per Slot Window</label>
              <input
                type="number"
                min="1"
                max="20"
                className={styles.input}
                value={formData.consultation.capacityPerSlot}
                onChange={(e) =>
                  handleConsultationChange('capacityPerSlot', parseInt(e.target.value, 10) || 1)
                }
              />
              <span className={styles.hint}>
                Max bookings allowed per window per day (e.g. 3).
              </span>
            </div>

            <div className={styles.field}>
              <label>Home Visit Consultation Mode</label>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <b>Enable At-Home Visits</b>
                  <span>Allow customers in serviceable pincodes to book home consultations.</span>
                </div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.consultation.homeVisit}
                  onChange={(e) => handleConsultationChange('homeVisit', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Brand Proof & Story */}
      {activeTab === 'story' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Brand Proof & Story Metrics</h2>
            <p>
              These values populate the About page metrics grid and brand origin narrative. Cards are
              hidden automatically if unconfigured.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.field}>
              <label>Founded Year</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 2018"
                value={formData.story.foundedYear}
                onChange={(e) => handleStoryChange('foundedYear', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Origin City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Delhi NCR"
                value={formData.story.originCity}
                onChange={(e) => handleStoryChange('originCity', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Partner Brands</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Comma separated, e.g. Samsung, Haier, Bosch, Godrej"
                value={formData.story.partnerBrands}
                onChange={(e) => handleStoryChange('partnerBrands', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Homes Furnished Count</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 12,000+"
                value={formData.story.metrics.homesFurnished}
                onChange={(e) => handleMetricChange('homesFurnished', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Pincodes Served Count</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 180+"
                value={formData.story.metrics.pincodesServed}
                onChange={(e) => handleMetricChange('pincodesServed', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Customer Satisfaction Rating</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 4.9 / 5.0"
                value={formData.story.metrics.satisfactionRate}
                onChange={(e) => handleMetricChange('satisfactionRate', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Founder Note / Brand Narrative</label>
              <textarea
                className={styles.textarea}
                placeholder="A genuine note from the founders on purpose, quality, and the idea of home."
                value={formData.story.founderNarrative}
                onChange={(e) => handleStoryChange('founderNarrative', e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Store Feature Status Preview */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2>Live Store Status Preview</h2>
          <p>
            The store avoids showing placeholder or developer text. Sections render only when
            backed by real configuration:
          </p>
        </div>

        <div className={styles.previewGrid}>
          <div className={styles.previewCard}>
            <span>Phone Support</span>
            <b>{formData.contact.phone || 'Not configured'}</b>
            <div
              className={`${styles.previewStatus} ${
                hasConfig(formData.contact.phone) ? styles.activeStatus : styles.hiddenStatus
              }`}
            >
              {hasConfig(formData.contact.phone) ? '● Visible on site' : '○ Hidden on site'}
            </div>
          </div>

          <div className={styles.previewCard}>
            <span>WhatsApp Chat</span>
            <b>{formData.contact.whatsapp || 'Not configured'}</b>
            <div
              className={`${styles.previewStatus} ${
                hasConfig(formData.contact.whatsapp) ? styles.activeStatus : styles.hiddenStatus
              }`}
            >
              {hasConfig(formData.contact.whatsapp) ? '● Visible on site' : '○ Hidden on site'}
            </div>
          </div>

          <div className={styles.previewCard}>
            <span>Experience Showroom</span>
            <b>{formData.showroom.addressLine1 ? `${formData.showroom.city || 'Showroom'}` : 'Not configured'}</b>
            <div
              className={`${styles.previewStatus} ${
                hasConfig(formData.showroom.addressLine1) ? styles.activeStatus : styles.hiddenStatus
              }`}
            >
              {hasConfig(formData.showroom.addressLine1) ? '● Visible on site' : '○ Hidden on site'}
            </div>
          </div>

          <div className={styles.previewCard}>
            <span>Brand Proof Metrics</span>
            <b>{formData.story.metrics.homesFurnished ? `${formData.story.metrics.homesFurnished} homes` : 'Not configured'}</b>
            <div
              className={`${styles.previewStatus} ${
                hasConfig(formData.story.metrics.homesFurnished) ? styles.activeStatus : styles.hiddenStatus
              }`}
            >
              {hasConfig(formData.story.metrics.homesFurnished) ? '● Visible on site' : '○ Hidden on site'}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.actionsBar}>
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.saveBtn}
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving settings…' : 'Save Store Settings'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={fetchSettings}
            disabled={isSaving}
          >
            Reload from Server
          </button>
        </div>
      </div>
    </div>
  );
}
