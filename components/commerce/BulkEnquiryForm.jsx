'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/track';
import Icon from '@/components/ui/Icon';
import styles from './BulkEnquiryForm.module.css';

const BUSINESS_TYPES = [
  { id: 'hospitality', label: '🏨 Hotels & Resorts' },
  { id: 'corporate', label: '🏢 Corporate Offices' },
  { id: 'coliving', label: '🏠 PG & Co-Living' },
  { id: 'builder', label: '🏗️ Builders & Real Estate' },
  { id: 'designer', label: '📐 Architects & Designers' },
  { id: 'other', label: '📦 Commercial Projects' }
];

const QUANTITY_OPTIONS = [
  '10 – 25 Units',
  '25 – 50 Units',
  '50 – 100 Units',
  '100+ Units'
];

const CATEGORY_OPTIONS = [
  'Living Room & Sofas',
  'Beds & Mattresses',
  'Modular Wardrobes',
  'Dining Sets & Seating',
  'Refrigerators & Kitchen',
  'Washing & Laundry Care',
  'TV & Air Conditioners',
  'Complete Turnkey Setup'
];

const TIMELINE_OPTIONS = [
  'Within 2 Weeks',
  'Within 1 Month',
  '1 – 3 Months',
  'Planning Stage'
];

export default function BulkEnquiryForm() {
  const [businessType, setBusinessType] = useState('hospitality');
  const [selectedCategories, setSelectedCategories] = useState(['Complete Turnkey Setup']);
  const [quantityRange, setQuantityRange] = useState('25 – 50 Units');
  const [timeline, setTimeline] = useState('Within 1 Month');

  const [form, setForm] = useState({
    companyName: '',
    gstin: '',
    contactPerson: '',
    phone: '',
    email: '',
    cityPincode: '',
    budgetRange: '₹2,00,000 – ₹10,00,000',
    preferredContactMethod: 'phone',
    specifications: '',
    honeypot: ''
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.contactPerson.trim() || form.contactPerson.trim().length < 2) {
      errs.contactPerson = 'Please enter contact person name.';
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid work email address.';
    }
    if (!form.companyName.trim()) {
      errs.companyName = 'Please enter your organization or business name.';
    }
    if (!form.cityPincode.trim()) {
      errs.cityPincode = 'Please provide target delivery city & pincode.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setSubmitError('');

    try {
      const typeLabel = BUSINESS_TYPES.find((t) => t.id === businessType)?.label || businessType;
      const parsedQty = parseInt(quantityRange.match(/\d+/)?.[0] || '25', 10);

      const messageContent = [
        `[Enterprise B2B Trade Enquiry]`,
        `Organization: ${form.companyName}`,
        form.gstin ? `GSTIN: ${form.gstin}` : null,
        `Industry: ${typeLabel}`,
        `Volume: ${quantityRange}`,
        `Categories: ${selectedCategories.join(', ') || 'General Project'}`,
        `Timeline: ${timeline}`,
        `Delivery Destination: ${form.cityPincode}`,
        form.specifications ? `Specifications/Notes: ${form.specifications}` : null
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        inquiryType: 'bulk',
        name: form.contactPerson,
        phone: form.phone,
        email: form.email,
        intendedUse: `${form.companyName} (${typeLabel})`,
        category: selectedCategories.join(', '),
        quantity: parsedQty,
        budgetRange: form.budgetRange,
        deliveryLocation: form.cityPincode,
        preferredDate: timeline,
        preferredContactMethod: form.preferredContactMethod,
        message: messageContent,
        specifications: form.specifications,
        honeypot: form.honeypot
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.received) {
        throw new Error(data.error?.message || data.error || 'Failed to submit trade quote request.');
      }

      setSuccessInfo({
        reference: data.reference,
        message: data.message || 'Thank you! Your trade inquiry has been submitted to our enterprise desk.'
      });

      trackEvent('b2b_inquiry_submit', {
        reference: data.reference,
        businessType,
        quantity: quantityRange
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (successInfo) {
    return (
      <div className={styles.successCard} role="status">
        <div className={styles.successIconWrap}>
          <Icon name="check" size={28} />
        </div>
        <h3 className={styles.successTitle}>Trade Quote Request Logged</h3>
        <p className={styles.successDesc}>
          Our B2B Enterprise Account Desk has received your project parameters. A dedicated quote manager will contact you with an itemized proforma within 4 working hours.
        </p>

        {successInfo.reference && (
          <div className={styles.refBadge}>
            <span className={styles.refLabel}>Official RFQ Reference</span>
            <span className={styles.refCode}>{successInfo.reference}</span>
          </div>
        )}

        <button
          type="button"
          className={styles.anotherBtn}
          onClick={() => {
            setSuccessInfo(null);
            setForm({
              companyName: '',
              gstin: '',
              contactPerson: '',
              phone: '',
              email: '',
              cityPincode: '',
              budgetRange: '₹2,00,000 – ₹10,00,000',
              preferredContactMethod: 'phone',
              specifications: '',
              honeypot: ''
            });
          }}
        >
          Submit another trade requirement
        </button>
      </div>
    );
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit} noValidate>
      {/* Bot protection */}
      <div className={styles.hpField} aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
        />
      </div>

      {/* Enterprise Trust Assurances */}
      <div className={styles.b2bPerksGrid}>
        <div className={styles.perkItem}>
          <span className={styles.perkIcon}><Icon name="shield" size={15} /></span>
          <span>GST ITC Tax Invoicing</span>
        </div>
        <div className={styles.perkItem}>
          <span className={styles.perkIcon}><Icon name="award" size={15} /></span>
          <span>Manufacturer Volume Pricing</span>
        </div>
        <div className={styles.perkItem}>
          <span className={styles.perkIcon}><Icon name="truck" size={15} /></span>
          <span>On-Site Delivery & Assembly</span>
        </div>
        <div className={styles.perkItem}>
          <span className={styles.perkIcon}><Icon name="user" size={15} /></span>
          <span>Dedicated Trade Desk Manager</span>
        </div>
      </div>

      {submitError && (
        <div style={{ padding: '12px 16px', background: '#fdeded', color: '#c62828', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {submitError}
        </div>
      )}

      {/* 1. Industry / Project Sector */}
      <div className={styles.formSection}>
        <span className={styles.sectionHeading}>
          <Icon name="building" size={14} /> 1. Project Sector / Industry
        </span>
        <div className={styles.chipsContainer}>
          {BUSINESS_TYPES.map((b) => (
            <button
              type="button"
              key={b.id}
              className={`${styles.chip} ${businessType === b.id ? styles.chipActive : ''}`}
              onClick={() => setBusinessType(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Organization & Contact Info */}
      <div className={styles.formSection}>
        <span className={styles.sectionHeading}>
          <Icon name="user" size={14} /> 2. Business & Contact Information
        </span>
        <div className={styles.fieldsGrid}>
          <div className={styles.field}>
            <label className={styles.label}>
              Organization / Firm Name *
            </label>
            <input
              className={styles.input}
              placeholder="e.g. Oberoi Living Spaces Ltd."
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              required
            />
            {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              GSTIN (Optional)
              <span className={styles.subLabel}>For Input Tax Credit</span>
            </label>
            <input
              className={styles.input}
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={form.gstin}
              onChange={(e) => update('gstin', e.target.value.toUpperCase())}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contact Person Name *</label>
            <input
              className={styles.input}
              placeholder="e.g. Rohit Singhania (Procurement)"
              value={form.contactPerson}
              onChange={(e) => update('contactPerson', e.target.value)}
              required
            />
            {errors.contactPerson && <span className={styles.errorText}>{errors.contactPerson}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Official Mobile Number *</label>
            <input
              className={styles.input}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number (e.g. 9876543210)"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Work Email Address</label>
            <input
              className={styles.input}
              type="email"
              placeholder="procurement@company.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Delivery City & Pincode *</label>
            <input
              className={styles.input}
              placeholder="e.g. Noida / 201301"
              value={form.cityPincode}
              onChange={(e) => update('cityPincode', e.target.value)}
              required
            />
            {errors.cityPincode && <span className={styles.errorText}>{errors.cityPincode}</span>}
          </div>
        </div>
      </div>

      {/* 3. Scope & Quantities */}
      <div className={styles.formSection}>
        <span className={styles.sectionHeading}>
          <Icon name="truck" size={14} /> 3. Project Scope & Categories Required
        </span>

        <div className={styles.categoryPillsGrid}>
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                type="button"
                key={cat}
                className={`${styles.catPill} ${isSelected ? styles.catPillSelected : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                <Icon name={isSelected ? 'check' : 'plus'} size={13} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.fieldsGrid} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <label className={styles.label}>Approximate Total Units</label>
            <div className={styles.radioPillGroup}>
              {QUANTITY_OPTIONS.map((q) => (
                <button
                  type="button"
                  key={q}
                  className={`${styles.radioPill} ${quantityRange === q ? styles.radioPillActive : ''}`}
                  onClick={() => setQuantityRange(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Required Delivery Timeline</label>
            <div className={styles.radioPillGroup}>
              {TIMELINE_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`${styles.radioPill} ${timeline === t ? styles.radioPillActive : ''}`}
                  onClick={() => setTimeline(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>
              Project Specifications or Custom Dimensions (Optional)
            </label>
            <textarea
              className={styles.textarea}
              placeholder="Mention required wood finish, fabric grade, commercial appliance models, or special site assembly requirements..."
              value={form.specifications}
              onChange={(e) => update('specifications', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Preferred Callback Mode</label>
            <select
              className={styles.select}
              value={form.preferredContactMethod}
              onChange={(e) => update('preferredContactMethod', e.target.value)}
            >
              <option value="phone">Direct Phone Call from Trade Specialist</option>
              <option value="whatsapp">WhatsApp Proforma & Catalogues</option>
              <option value="email">Official Email Proposal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className={styles.submitSection}>
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy ? 'Preparing RFQ Submission...' : 'Request Custom Trade Quote'}
          <Icon name="arrow" size={16} />
        </button>
        <span className={styles.guaranteeNote}>
          <Icon name="shield" size={13} color="var(--rf-green-700)" />
          Zero-spam policy. Handled exclusively by the RF Riddhy Enterprise Commercial Desk.
        </span>
      </div>
    </form>
  );
}
