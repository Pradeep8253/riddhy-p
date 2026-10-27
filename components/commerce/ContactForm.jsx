'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/track';
import Icon from '@/components/ui/Icon';
import styles from './ContactForm.module.css';

const TOPIC_OPTIONS = [
  { id: 'general', label: 'General Inquiry', icon: 'mail', hint: 'Questions about our collections, showroom, or store policies.' },
  { id: 'order', label: 'Order Status & Tracking', icon: 'truck', hint: 'Check order progress, dispatch dates, or delivery scheduling.' },
  { id: 'installation', label: 'Delivery & Installation', icon: 'pin', hint: 'Assembly support, site inspection, or delivery rescheduling.' },
  { id: 'warranty', label: 'Warranty & Service Claim', icon: 'shield', hint: 'Aftercare, repair support, or warranty coverage verification.' },
  { id: 'returns', label: 'Returns & Refunds', icon: 'compare', hint: 'Transit damage, return window queries, or refund processing.' },
  { id: 'product', label: 'Product Advice & Sizing', icon: 'info', hint: 'Fabric options, mattress firmness, or room dimension fit.' }
];

export default function ContactForm({ initialTopic = 'general' }) {
  const [topic, setTopic] = useState(
    TOPIC_OPTIONS.some((t) => t.id === initialTopic) ? initialTopic : 'general'
  );

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: '',
    preferredContactMethod: 'whatsapp',
    honeypot: ''
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const isOrderRelated = ['order', 'installation', 'warranty', 'returns'].includes(topic);

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

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Please enter your full name (at least 2 characters).';
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!form.message.trim() || form.message.trim().length < 5) {
      errs.message = 'Please provide details about your question or inquiry.';
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
      const selectedTopicObj = TOPIC_OPTIONS.find((t) => t.id === topic);
      const payload = {
        inquiryType: 'general',
        topic,
        name: form.name,
        phone: form.phone,
        email: form.email,
        orderNumber: form.orderNumber,
        subject: form.subject || `${selectedTopicObj?.label || 'General Contact'}: Query from ${form.name}`,
        message: form.message,
        preferredContactMethod: form.preferredContactMethod,
        honeypot: form.honeypot
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.received) {
        throw new Error(data.error?.message || data.error || 'Failed to submit your message.');
      }

      setSuccessInfo({
        reference: data.reference,
        message: data.message || 'Thank you! Your message has been received by our customer care team.'
      });

      trackEvent('contact_submit', {
        reference: data.reference,
        topic
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
        <h3 className={styles.successTitle}>Message Received</h3>
        <p className={styles.successDesc}>
          {successInfo.message} A customer care specialist will respond through your preferred channel ({form.preferredContactMethod.toUpperCase()}).
        </p>

        {successInfo.reference && (
          <div className={styles.refBadge}>
            <span className={styles.refLabel}>Support Reference Number</span>
            <span className={styles.refCode}>{successInfo.reference}</span>
          </div>
        )}

        <button
          type="button"
          className={styles.anotherBtn}
          onClick={() => {
            setSuccessInfo(null);
            setForm({
              name: '',
              phone: '',
              email: '',
              orderNumber: '',
              subject: '',
              message: '',
              preferredContactMethod: 'whatsapp',
              honeypot: ''
            });
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const activeTopicObj = TOPIC_OPTIONS.find((t) => t.id === topic);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Bot protection */}
      <div className={styles.hpField} aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
        />
      </div>

      {submitError && (
        <div style={{ padding: '12px 16px', background: '#fdeded', color: '#c62828', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {submitError}
        </div>
      )}

      {/* 1. Quick Topic Selector */}
      <div className={styles.topicSelectorSection}>
        <span className={styles.topicLabel}>
          <Icon name="sliders" size={13} /> Select Topic
        </span>
        <div className={styles.topicPillsGrid}>
          {TOPIC_OPTIONS.map((t) => {
            const isActive = topic === t.id;
            return (
              <button
                type="button"
                key={t.id}
                className={`${styles.topicPill} ${isActive ? styles.topicPillActive : ''}`}
                onClick={() => setTopic(t.id)}
              >
                <Icon name={t.icon} size={15} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Context Hint / Order ID prompt */}
      {isOrderRelated && (
        <div className={styles.orderContextBanner}>
          <div className={styles.orderContextHint}>
            <Icon name="truck" size={15} color="var(--rf-green-800)" />
            <span>
              Have your Order ID handy? Enter it below so our desk can pull up your delivery record instantly.
            </span>
          </div>
          <div className={styles.field}>
            <input
              className={styles.input}
              placeholder="Order ID / Invoice # (e.g. ORD-2026-8941)"
              value={form.orderNumber}
              onChange={(e) => update('orderNumber', e.target.value.toUpperCase())}
            />
          </div>
        </div>
      )}

      {/* 2. Contact Fields Grid */}
      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Your Name *</label>
          <input
            className={styles.input}
            placeholder="e.g. Ramesh Verma"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Mobile Number *</label>
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
          <label className={styles.label}>Email Address (Optional)</label>
          <input
            className={styles.input}
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Preferred Response Mode</label>
          <div className={styles.channelsRow}>
            <button
              type="button"
              className={`${styles.channelOption} ${form.preferredContactMethod === 'whatsapp' ? styles.whatsappActive : ''}`}
              onClick={() => update('preferredContactMethod', 'whatsapp')}
            >
              <Icon name="whatsapp" size={15} />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              className={`${styles.channelOption} ${form.preferredContactMethod === 'phone' ? styles.channelOptionActive : ''}`}
              onClick={() => update('preferredContactMethod', 'phone')}
            >
              <Icon name="phone" size={14} />
              <span>Call</span>
            </button>
            <button
              type="button"
              className={`${styles.channelOption} ${form.preferredContactMethod === 'email' ? styles.channelOptionActive : ''}`}
              onClick={() => update('preferredContactMethod', 'email')}
            >
              <Icon name="mail" size={14} />
              <span>Email</span>
            </button>
          </div>
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>Subject (Optional)</label>
          <input
            className={styles.input}
            placeholder={`e.g. Question regarding ${activeTopicObj?.label.toLowerCase() || 'products'}`}
            value={form.subject}
            onChange={(e) => update('subject', e.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>How can we help? *</label>
          <textarea
            className={styles.textarea}
            placeholder={activeTopicObj?.hint || 'Please describe your request in detail...'}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            required
          />
          {errors.message && <span className={styles.errorText}>{errors.message}</span>}
        </div>
      </div>

      {/* Submit Action */}
      <div className={styles.submitSection}>
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy ? 'Sending Message...' : 'Send Message to Customer Care'}
          <Icon name="arrow" size={16} />
        </button>
        <span className={styles.supportFootnote}>

          We typically reply in under 2 hours during store hours (10:00 AM – 8:00 PM).
        </span>
      </div>
    </form>
  );
}
