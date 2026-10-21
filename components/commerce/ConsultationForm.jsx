'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { checkServiceability } from '@/lib/serviceability';
import { siteConfig } from '@/lib/site-config';
import { tr } from '@/lib/i18n';
import { trackEvent } from '@/lib/track';
import Icon from '@/components/ui/Icon';
import styles from './ConsultationForm.module.css';

const STORAGE_KEY = 'rf_consultation_draft_v1';

const INITIAL_STATE = {
  name: '',
  phone: '',
  email: '',
  pincode: '',
  interests: ['furniture'],
  roomType: 'living',
  budgetRange: '₹50,000 – ₹1,50,000',
  timeline: 'month',
  message: '',
  mode: 'phone',
  preferredDate: '',
  timeWindow: 'morning',
  altDate: '',
  altTimeWindow: '',
  language: 'en',
  whatsappOptIn: true,
  consent: false,
  honeypot: ''
};

const BUDGET_OPTIONS = [
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹3,00,000',
  '₹3,00,000 – ₹6,00,000',
  'Above ₹6,00,000'
];

function generateIcs(booking) {
  const dateStr = booking.preferredDate || new Date().toISOString().split('T')[0];
  const cleanDate = dateStr.replace(/-/g, '');
  let startHour = '100000';
  let endHour = '110000';
  if (booking.timeWindow === 'afternoon') {
    startHour = '140000';
    endHour = '150000';
  } else if (booking.timeWindow === 'evening') {
    startHour = '180000';
    endHour = '190000';
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RF Riddhy//Home Consultation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:consultation-${booking.reference || Date.now()}@riddhy.in`,
    `DTSTAMP:${cleanDate}T${startHour}Z`,
    `DTSTART:${cleanDate}T${startHour}`,
    `DTEND:${cleanDate}T${endHour}`,
    `SUMMARY:RF Riddhy Home Consultation [Ref: ${booking.reference}]`,
    `DESCRIPTION:Your guided home consultation session with the RF Riddhy team. Reference: ${booking.reference}. Mode: ${booking.mode}.`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `riddhy-consultation-${booking.reference}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ConsultationForm({ initialProductSlug = '', initialInterest = '' }) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [serviceStatus, setServiceStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [loadTime, setLoadTime] = useState(Date.now());
  const errorSummaryRef = useRef(null);

  // Restore draft from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({
          ...prev,
          ...parsed,
          interests: initialInterest ? [initialInterest] : parsed.interests || prev.interests
        }));
        if (parsed.pincode && /^\d{6}$/.test(parsed.pincode)) {
          setServiceStatus(checkServiceability(parsed.pincode));
        }
      } else if (initialInterest) {
        setForm((prev) => ({ ...prev, interests: [initialInterest] }));
      }
    } catch {
      // sessionStorage blocked or unavailable
    }
    setLoadTime(Date.now());
    trackEvent('consultation_step_view', { step: 1 });
  }, [initialInterest]);

  // Persist draft changes
  const updateField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handlePincodeChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    updateField('pincode', raw);
    if (raw.length === 6) {
      const check = checkServiceability(raw);
      setServiceStatus(check);
    } else {
      setServiceStatus(null);
    }
  };

  const toggleInterest = (val) => {
    const current = new Set(form.interests);
    if (current.has(val)) {
      if (current.size > 1) current.delete(val);
    } else {
      current.add(val);
    }
    updateField('interests', Array.from(current));
  };

  // Step Validation
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.name.trim() || form.name.trim().length < 2) {
        newErrors.name = 'Please enter your full name (at least 2 characters).';
      }
      if (!/^[6-9]\d{9}$/.test(form.phone)) {
        newErrors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!/^\d{6}$/.test(form.pincode)) {
        newErrors.pincode = 'Enter a valid 6-digit Indian postal pincode.';
      }
    } else if (currentStep === 2) {
      if (!form.interests || form.interests.length === 0) {
        newErrors.interests = 'Please select at least one item of interest.';
      }
      if (!form.roomType) {
        newErrors.roomType = 'Please select a primary room.';
      }
    } else if (currentStep === 3) {
      if (!form.preferredDate) {
        newErrors.preferredDate = 'Please choose a consultation date.';
      }
      if (!form.timeWindow) {
        newErrors.timeWindow = 'Please choose a preferred time window.';
      }
      if (!form.consent) {
        newErrors.consent = 'You must provide consent to proceed with scheduling.';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      const nextStep = step + 1;
      setStep(nextStep);
      trackEvent('consultation_step_view', { step: nextStep });
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    const prevStep = Math.max(1, step - 1);
    setStep(prevStep);
    trackEvent('consultation_step_view', { step: prevStep });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setBusy(true);
    setSubmitError('');

    const submitDuration = Date.now() - loadTime;

    const payload = {
      ...form,
      submitDuration
    };

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Unable to book consultation. Please try again.');
      }

      setSuccessData({
        ...form,
        reference: json.data?.reference || 'RC-CONFIRMED',
        message: json.data?.message
      });

      // Clear draft
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      trackEvent('consultation_submit', {
        reference: json.data?.reference,
        mode: form.mode,
        interests: form.interests
      });
    } catch (err) {
      setSubmitError(err.message || 'An error occurred while booking. Please try again.');
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_STATE);
    setSuccessData(null);
    setStep(1);
    setErrors({});
    setSubmitError('');
    setLoadTime(Date.now());
  };

  // Date range: Tomorrow to +30 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Success Screen
  if (successData) {
    return (
      <div className={styles.successCard} role="status" aria-live="polite">
        <div className={styles.successIcon}>
          <Icon name="check" size={32} />
        </div>
        <span className="kicker">{tr(locale, 'consultationSuccess')}</span>
        <h2>Your space, considered with care.</h2>
        <p className={styles.successMsg}>
          {successData.message || 'We have reserved your consultation window. Our design team will connect with you at your chosen time.'}
        </p>

        <div className={styles.refBox}>
          <span>{tr(locale, 'bookingRef')}</span>
          <strong>{successData.reference}</strong>
          <small>Keep this reference handy for any scheduling changes.</small>
        </div>

        <div className={styles.summaryDetails}>
          <div>
            <b>Date & Slot:</b> {successData.preferredDate} ({successData.timeWindow})
          </div>
          <div>
            <b>Mode:</b> {successData.mode.toUpperCase()}
          </div>
          <div>
            <b>Contact:</b> {successData.phone} {successData.email ? `· ${successData.email}` : ''}
          </div>
        </div>

        <div className={styles.successActions}>
          <button
            type="button"
            className={styles.calendarBtn}
            onClick={() => generateIcs(successData)}
          >
            <Icon name="calendar" size={18} />
            {tr(locale, 'addToCalendar')}
          </button>
          <button type="button" className={styles.resetBtn} onClick={resetForm}>
            {tr(locale, 'bookAnother')}
          </button>
          <Link href="/furniture" className={styles.catalogueLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {tr(locale, 'exploreCatalogue')} <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Wizard Form */}
      <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
        {/* Progress indicator */}
        <div className={styles.progressBar} role="tablist" aria-label="Consultation Steps">
          <div className={`${styles.stepNode} ${step >= 1 ? styles.activeStep : ''}`}>
            <span>1</span>
            <small>{tr(locale, 'step1Title')}</small>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepNode} ${step >= 2 ? styles.activeStep : ''}`}>
            <span>2</span>
            <small>{tr(locale, 'step2Title')}</small>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepNode} ${step >= 3 ? styles.activeStep : ''}`}>
            <span>3</span>
            <small>{tr(locale, 'step3Title')}</small>
          </div>
        </div>

        {/* Honeypot field (hidden from real users) */}
        <div className={styles.hpField} aria-hidden="true">
          <label htmlFor="hp_contact_addr">Do not fill this field</label>
          <input
            id="hp_contact_addr"
            name="hp_address"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(e) => updateField('honeypot', e.target.value)}
          />
        </div>

        {/* Error summary */}
        {(submitError || Object.keys(errors).length > 0) && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            className={styles.errorSummary}
            role="alert"
            aria-live="assertive"
          >
            <strong>Please check the following details:</strong>
            <ul>
              {submitError && <li>{submitError}</li>}
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* STEP 1: ABOUT YOU */}
        {step === 1 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <span className="kicker">Step 1 of 3</span>
              <h3>Tell us about yourself</h3>
              <p>We’ll use these details to coordinate your consultation session.</p>
            </legend>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="c_name">{tr(locale, 'fullName')} *</label>
                <input
                  id="c_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'err_name' : undefined}
                />
                {errors.name && <span id="err_name" className={styles.inlineErr}>{errors.name}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c_phone">{tr(locale, 'mobileNumber')} *</label>
                <input
                  id="c_phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'err_phone' : undefined}
                />
                {errors.phone && <span id="err_phone" className={styles.inlineErr}>{errors.phone}</span>}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="c_email">{tr(locale, 'emailAddress')}</label>
                <input
                  id="c_email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Optional, for calendar invite"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'err_email' : undefined}
                />
                {errors.email && <span id="err_email" className={styles.inlineErr}>{errors.email}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c_pincode">{tr(locale, 'pincode')} *</label>
                <input
                  id="c_pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={form.pincode}
                  onChange={handlePincodeChange}
                  placeholder="6-digit pincode"
                  aria-invalid={Boolean(errors.pincode)}
                  aria-describedby={errors.pincode ? 'err_pincode' : undefined}
                />
                {errors.pincode && <span id="err_pincode" className={styles.inlineErr}>{errors.pincode}</span>}
              </div>
            </div>

            {/* Serviceability live check banner */}
            {serviceStatus && (
              <div
                className={`${styles.serviceBadge} ${serviceStatus.serviceable ? styles.serviceGood : styles.serviceNotice}`}
              >
                <Icon name={serviceStatus.serviceable ? 'check' : 'info'} size={18} />
                <span>
                  {serviceStatus.serviceable
                    ? tr(locale, 'serviceableArea')
                    : tr(locale, 'nonServiceableArea')}
                </span>
              </div>
            )}

            <div className={styles.buttonRow}>
              <div />
              <button type="button" className={styles.primaryBtn} onClick={goToNextStep} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Next: Your need <Icon name="arrow" size={14} />
              </button>
            </div>
          </fieldset>
        )}

        {/* STEP 2: YOUR NEED */}
        {step === 2 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <span className="kicker">Step 2 of 3</span>
              <h3>What would you like to plan?</h3>
              <p>Select what you need help with so we can pair you with the right specialist.</p>
            </legend>

            <div className={styles.fieldGroup}>
              <label>{tr(locale, 'interests')} *</label>
              <div className={styles.pillGroup} role="group" aria-label="Interests">
                {[
                  ['furniture', tr(locale, 'interestFurniture')],
                  ['appliances', tr(locale, 'interestAppliances')],
                  ['full_home', tr(locale, 'interestFullHome')]
                ].map(([val, labelText]) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.pill} ${form.interests.includes(val) ? styles.pillActive : ''}`}
                    onClick={() => toggleInterest(val)}
                    aria-pressed={form.interests.includes(val)}
                  >
                    {form.interests.includes(val) && <Icon name="check" size={14} />}
                    {labelText}
                  </button>
                ))}
              </div>
              {errors.interests && <span className={styles.inlineErr}>{errors.interests}</span>}
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="c_room">{tr(locale, 'roomType')} *</label>
                <select
                  id="c_room"
                  value={form.roomType}
                  onChange={(e) => updateField('roomType', e.target.value)}
                >
                  <option value="living">{tr(locale, 'roomLiving')}</option>
                  <option value="bedroom">{tr(locale, 'roomBedroom')}</option>
                  <option value="kitchen">{tr(locale, 'roomKitchen')}</option>
                  <option value="dining">{tr(locale, 'roomDining')}</option>
                  <option value="study">{tr(locale, 'roomStudy')}</option>
                  <option value="whole_home">{tr(locale, 'roomWholeHome')}</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c_budget">{tr(locale, 'budgetRange')}</label>
                <select
                  id="c_budget"
                  value={form.budgetRange}
                  onChange={(e) => updateField('budgetRange', e.target.value)}
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="c_timeline">{tr(locale, 'timeline')}</label>
              <select
                id="c_timeline"
                value={form.timeline}
                onChange={(e) => updateField('timeline', e.target.value)}
              >
                <option value="week">{tr(locale, 'timelineWeek')}</option>
                <option value="month">{tr(locale, 'timelineMonth')}</option>
                <option value="ahead">{tr(locale, 'timelineAhead')}</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="c_message">Room details & notes (optional)</label>
              <textarea
                id="c_message"
                rows={4}
                maxLength={1500}
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder={tr(locale, 'notesPlaceholder')}
              />
              <small className={styles.charCount}>{1500 - form.message.length} characters left</small>
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.secondaryBtn} onClick={goToPrevStep} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrowLeft" size={14} /> Back
              </button>
              <button type="button" className={styles.primaryBtn} onClick={goToNextStep} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Next: Pick slot <Icon name="arrow" size={14} />
              </button>
            </div>
          </fieldset>
        )}

        {/* STEP 3: PICK HOW & WHEN */}
        {step === 3 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <span className="kicker">Step 3 of 3</span>
              <h3>Choose your session time</h3>
              <p>Pick how and when you’d like to speak with our home specialist.</p>
            </legend>

            <div className={styles.fieldGroup}>
              <label>{tr(locale, 'consultationMode')} *</label>
              <div className={styles.modeCards} role="radiogroup" aria-label="Consultation Mode">
                {siteConfig.consultation.modes.phone && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={form.mode === 'phone'}
                    className={`${styles.modeCard} ${form.mode === 'phone' ? styles.modeActive : ''}`}
                    onClick={() => updateField('mode', 'phone')}
                  >
                    <Icon name="phone" size={22} />
                    <b>{tr(locale, 'modePhone')}</b>
                    <small>15–20 min voice call</small>
                  </button>
                )}

                {siteConfig.consultation.modes.video && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={form.mode === 'video'}
                    className={`${styles.modeCard} ${form.mode === 'video' ? styles.modeActive : ''}`}
                    onClick={() => updateField('mode', 'video')}
                  >
                    <Icon name="video" size={22} />
                    <b>{tr(locale, 'modeVideo')}</b>
                    <small>Screen-share & plan</small>
                  </button>
                )}

                {siteConfig.consultation.modes.showroom && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={form.mode === 'showroom'}
                    className={`${styles.modeCard} ${form.mode === 'showroom' ? styles.modeActive : ''}`}
                    onClick={() => updateField('mode', 'showroom')}
                  >
                    <Icon name="mapPin" size={22} />
                    <b>{tr(locale, 'modeShowroom')}</b>
                    <small>Touch & feel pieces</small>
                  </button>
                )}

                {siteConfig.consultation.modes.home && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={form.mode === 'home'}
                    className={`${styles.modeCard} ${form.mode === 'home' ? styles.modeActive : ''}`}
                    onClick={() => updateField('mode', 'home')}
                  >
                    <Icon name="home" size={22} />
                    <b>{tr(locale, 'modeHome')}</b>
                    <small>In-person space visit</small>
                  </button>
                )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="c_date">{tr(locale, 'preferredDate')} *</label>
                <input
                  id="c_date"
                  type="date"
                  lang="en-IN"
                  required
                  min={minDate}
                  max={maxDate}
                  value={form.preferredDate}
                  onChange={(e) => updateField('preferredDate', e.target.value)}
                  aria-invalid={Boolean(errors.preferredDate)}
                  aria-describedby={errors.preferredDate ? 'err_date' : undefined}
                />
                {errors.preferredDate && (
                  <span id="err_date" className={styles.inlineErr}>
                    {errors.preferredDate}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c_window">{tr(locale, 'preferredTime')} *</label>
                <select
                  id="c_window"
                  value={form.timeWindow}
                  onChange={(e) => updateField('timeWindow', e.target.value)}
                >
                  <option value="morning">Morning (10:00 AM – 1:00 PM)</option>
                  <option value="afternoon">Afternoon (2:00 PM – 5:00 PM)</option>
                  <option value="evening">Evening (6:00 PM – 8:00 PM)</option>
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="c_lang">{tr(locale, 'languagePref')}</label>
                <select
                  id="c_lang"
                  value={form.language}
                  onChange={(e) => updateField('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c_altDate">{tr(locale, 'altSlot')}</label>
                <input
                  id="c_altDate"
                  type="date"
                  lang="en-IN"
                  min={minDate}
                  max={maxDate}
                  value={form.altDate}
                  onChange={(e) => updateField('altDate', e.target.value)}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className={styles.checksGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.whatsappOptIn}
                  onChange={(e) => updateField('whatsappOptIn', e.target.checked)}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="whatsapp" size={16} color="#25d366" />
                  {tr(locale, 'optInWhatsApp')}
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => updateField('consent', e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'err_consent' : undefined}
                />
                <span>
                  {tr(locale, 'consentDPDP')}{' '}
                  <Link href="/policies/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  . *
                </span>
              </label>
              {errors.consent && (
                <span id="err_consent" className={styles.inlineErr}>
                  {errors.consent}
                </span>
              )}
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.secondaryBtn} onClick={goToPrevStep} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrowLeft" size={14} /> Back
              </button>
              <button type="submit" className={styles.primaryBtn} disabled={busy}>
                {busy ? tr(locale, 'submitting') : tr(locale, 'bookMyConsultation')}
              </button>
            </div>
          </fieldset>
        )}
      </form>

      {/* Real-time Summary Card (Sticky on Desktop) */}
      <aside className={styles.summaryAside} aria-label="Booking summary">
        <div className={styles.summaryCard}>
          <div className={styles.summaryHead}>
            <span className="kicker">Live Overview</span>
            <h4>Your Consultation</h4>
          </div>

          <dl className={styles.summaryList}>
            <div>
              <dt>Customer:</dt>
              <dd>{form.name || '—'}</dd>
            </div>
            <div>
              <dt>Contact:</dt>
              <dd>{form.phone ? `+91 ${form.phone}` : '—'}</dd>
            </div>
            <div>
              <dt>Pincode:</dt>
              <dd>{form.pincode || '—'}</dd>
            </div>
            <div>
              <dt>Room / Needs:</dt>
              <dd>
                {form.roomType ? form.roomType.replace('_', ' ') : '—'} ·{' '}
                {form.interests.length ? form.interests.join(', ') : '—'}
              </dd>
            </div>
            <div>
              <dt>Budget:</dt>
              <dd>{form.budgetRange || '—'}</dd>
            </div>
            <div>
              <dt>Mode:</dt>
              <dd className={styles.modeTag}>{form.mode.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Slot:</dt>
              <dd>{form.preferredDate ? `${form.preferredDate} (${form.timeWindow})` : 'To be chosen'}</dd>
            </div>
          </dl>

          <div className={styles.summaryTrust}>
            <Icon name="shield" size={16} />
            <small>No spam. Zero obligation to buy. Dedicated advisor.</small>
          </div>
        </div>
      </aside>
    </div>
  );
}
