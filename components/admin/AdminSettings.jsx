'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { GST_STATES, getStateCode } from '@/lib/gst-states';
import { validateGSTIN, validatePAN } from '@/config/gstConfig';
import styles from './AdminSettings.module.css';

const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
const PINCODE_REGEX = /^\d{6}$/;

export default function AdminSettings() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  const [activeTab, setActiveTab] = useState(
    tabParam && ['company', 'care', 'showroom', 'consultation', 'story'].includes(tabParam)
      ? tabParam
      : 'company'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [source, setSource] = useState('database');
  const [warehouses, setWarehouses] = useState([]);
  const [companyValidation, setCompanyValidation] = useState({ valid: true, errors: [] });

  const [formData, setFormData] = useState({
    company: {
      legalName: '',
      tradeName: '',
      gstin: '',
      pan: '',
      state: 'Delhi',
      stateCode: '07',
      jurisdictionCity: 'New Delhi',
      addressLine1: '',
      addressLine2: '',
      city: 'New Delhi',
      pincode: '',
      phone: '',
      email: '',
      invoicePrefix: 'RF',
      creditNotePrefix: 'CN',
      invoiceTiming: 'paid',
      defaultWarehouseCode: 'DELHI-01',
      currency: 'INR',
      logoUrl: '',
      signatureUrl: '',
      website: 'https://rfriddhy.com',
      bankName: '',
      accountNo: '',
      ifsc: '',
      upiId: '',
      defaultGstRate: 18,
      deliverySac: '9965',
      installationSac: '9987',
      returnPolicyText: 'Returns accepted within 7 days in original packaging subject to inspection.',
      invoiceTerms: '1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. All disputes subject to local jurisdiction.',
      invoiceFooterNote: 'Thank you for choosing RF Riddhy. For support & warranty, email care@riddhy.in or WhatsApp +91 99342 08035.',
      nextInvoiceNumber: 1
    },
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

  const initialDataRef = useRef(null);

  useEffect(() => {
    if (tabParam && ['company', 'care', 'showroom', 'consultation', 'story'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch company specific settings and warehouses
      const [settingsRes, companyRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/settings/company').catch(() => null)
      ]);

      const data = await settingsRes.json();
      const companyData = companyRes ? await companyRes.json() : null;

      if (companyData?.success && companyData.data?.warehouses) {
        setWarehouses(companyData.data.warehouses);
      }
      if (companyData?.data?.validation) {
        setCompanyValidation(companyData.data.validation);
      }

      if (data.success && data.data) {
        const d = data.data.settings || data.data;
        const comp = companyData?.data?.settings || d.company || {};
        setSource(data.data?.source || data.source || 'database');

        const initialVals = {
          company: {
            legalName: comp.legalName || 'RF Riddhy Furniture & Appliances Pvt Ltd',
            tradeName: comp.tradeName || 'RF Riddhy',
            gstin: comp.gstin || '',
            pan: comp.pan || '',
            state: comp.state || 'Delhi',
            stateCode: comp.stateCode || '07',
            jurisdictionCity: comp.jurisdictionCity || 'New Delhi',
            addressLine1: comp.addressLine1 || '',
            addressLine2: comp.addressLine2 || '',
            city: comp.city || 'New Delhi',
            pincode: comp.pincode || '',
            phone: comp.phone || '+91 98765 43210',
            email: comp.email || 'billing@rfriddhy.com',
            invoicePrefix: comp.invoicePrefix || 'RF',
            creditNotePrefix: comp.creditNotePrefix || 'CN',
            invoiceTiming: comp.invoiceTiming || 'paid',
            defaultWarehouseCode: comp.defaultWarehouseCode || 'DELHI-01',
            currency: comp.currency || 'INR',
            logoUrl: comp.logoUrl || '',
            signatureUrl: comp.signatureUrl || '',
            website: comp.website || 'https://rfriddhy.com',
            bankName: comp.bankName || '',
            accountNo: comp.accountNo || '',
            ifsc: comp.ifsc || '',
            upiId: comp.upiId || '',
            defaultGstRate: comp.defaultGstRate ?? 18,
            deliverySac: comp.deliverySac || '9965',
            installationSac: comp.installationSac || '9987',
            returnPolicyText: comp.returnPolicyText || 'Returns accepted within 7 days in original packaging subject to inspection.',
            invoiceTerms: comp.invoiceTerms || '1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. All disputes subject to local jurisdiction.',
            invoiceFooterNote: comp.invoiceFooterNote || 'Thank you for choosing RF Riddhy. For support & warranty, email care@riddhy.in or WhatsApp +91 99342 08035.',
            nextInvoiceNumber: comp.nextInvoiceNumber || 1
          },
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
        };

        setFormData(initialVals);
        initialDataRef.current = JSON.stringify(initialVals);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load store settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = initialDataRef.current && JSON.stringify(formData) !== initialDataRef.current;

  const handleCompanyChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: val }
    }));
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

  const handleReset = () => {
    if (initialDataRef.current) {
      setFormData(JSON.parse(initialDataRef.current));
      setToast({ type: 'warning', message: 'Reverted all unsaved modifications.' });
    }
  };

  // State code vs GSTIN consistency check
  const gstinPrefix = formData.company.gstin ? formData.company.gstin.slice(0, 2) : '';
  const isStateCodeMismatch = Boolean(
    gstinPrefix &&
    formData.company.stateCode &&
    gstinPrefix.toUpperCase() !== formData.company.stateCode.toUpperCase()
  );

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setToast(null);

    // Save company settings specifically via dedicated super-admin endpoint
    try {
      const companySaveRes = await fetch('/api/admin/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.company)
      });

      const companyData = await companySaveRes.json();
      if (!companySaveRes.ok || !companyData.success) {
        setToast({
          type: 'error',
          message: companyData.error?.message || 'Validation error in Company Settings. Check GSTIN / PAN / State code.'
        });
        setIsSaving(false);
        return;
      }

      // Also save other store settings
      const payload = {
        company: formData.company,
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

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSource('database');
        initialDataRef.current = JSON.stringify(formData);
        setToast({ type: 'success', message: 'All company & store settings saved and published successfully.' });
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
          <h1>Company & Store Settings</h1>
          <p>
            Manage legal company credentials, GSTIN, invoice sequence numbering, fulfillment defaults,
            customer care desks, showroom addresses, and verified brand proof metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isDirty && (
            <span className={styles.dirtyBadge}>
              <span className={styles.statusDot} style={{ background: '#b78103' }} />
              Unsaved Changes
            </span>
          )}
          <div
            className={`${styles.statusBadge} ${
              source === 'database' ? styles.badgeDb : styles.badgeEnv
            }`}
          >
            <span className={styles.statusDot} />
            <span>
              {source === 'database'
                ? 'Stored in Database (Overrides .env)'
                : 'Loaded from .env Defaults'}
            </span>
          </div>
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
          className={`${styles.tabBtn} ${activeTab === 'company' ? styles.active : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company & Invoice
        </button>
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

      {/* Tab 0: Company & Invoice */}
      {activeTab === 'company' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Company Legal Identity & Invoicing Rules</h2>
            <p>
              These values configure your seller profile for sequential GST invoices, credit notes,
              tax place-of-supply determination, and warehouse dispatch fulfillment.
            </p>
          </div>

          <div className={styles.infoBanner}>
            <Icon name="shield" size={16} />
            <span>
              <strong>Regulatory Notice:</strong> Ensure GSTIN and State Code match your official GST registration certificate.
              All newly generated tax invoices will automatically adopt these credentials immediately upon saving.
            </span>
          </div>

          <div className={styles.grid2}>
            {/* Subsection 1: Legal Entity */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>1. Legal Entity & Brand Identity</h3>
              <p className={styles.subSectionDesc}>Official registration credentials printed on GST invoices and regulatory filings.</p>
            </div>

            <div className={styles.field}>
              <label>Legal Business Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. RF Riddhy Furniture & Appliances Pvt Ltd"
                value={formData.company.legalName}
                onChange={(e) => handleCompanyChange('legalName', e.target.value)}
              />
              <span className={styles.hint}>Full legal entity name registered under MCA / Registrar of Companies.</span>
            </div>

            <div className={styles.field}>
              <label>Trade Name / Brand</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. RF Riddhy"
                value={formData.company.tradeName}
                onChange={(e) => handleCompanyChange('tradeName', e.target.value)}
              />
              <span className={styles.hint}>Customer-facing brand name displayed across the website and storefront.</span>
            </div>

            <div className={styles.field}>
              <label>Official Website</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://rfriddhy.com"
                value={formData.company.website}
                onChange={(e) => handleCompanyChange('website', e.target.value)}
              />
              <span className={styles.hint}>Primary domain printed on invoice receipts and emails.</span>
            </div>

            <div className={styles.field}>
              <label>Corporate Logo URL (Optional)</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://.../logo.png"
                value={formData.company.logoUrl}
                onChange={(e) => handleCompanyChange('logoUrl', e.target.value)}
              />
              <span className={styles.hint}>High-resolution vector or PNG logo for generated PDF invoices.</span>
            </div>

            <div className={styles.field}>
              <label>Authorized Signatory Digital Signature URL (Optional)</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://.../signature.png"
                value={formData.company.signatureUrl}
                onChange={(e) => handleCompanyChange('signatureUrl', e.target.value)}
              />
              <span className={styles.hint}>Transparent PNG signature image embedded on official PDF tax invoices.</span>
            </div>

            {/* Subsection 2: Tax Credentials */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>2. Tax Credentials (GSTIN & PAN)</h3>
              <p className={styles.subSectionDesc}>Used for Goods & Services Tax calculations, TDS, and credit note issuance.</p>
            </div>

            {!companyValidation.valid && (
              <div className={styles.gridFull} style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: 8, padding: '12px 16px', color: '#991b1b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="alert-circle" size={18} />
                <div>
                  <strong>Missing Tax Requirements:</strong> Invoices cannot be issued until the following are completed: {companyValidation.errors?.join(', ')}.
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label>GSTIN (15 characters)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={formData.company.gstin}
                onChange={(e) => handleCompanyChange('gstin', e.target.value.toUpperCase())}
                maxLength={15}
              />
              <span className={styles.hint}>Mandatory 15-character Goods & Services Tax Identification Number.</span>
              {formData.company.gstin && (!GSTIN_REGEX.test(formData.company.gstin) || !validateGSTIN(formData.company.gstin)) && (
                <span className={styles.validationWarning}>
                  <Icon name="alert-circle" size={13} /> Invalid GSTIN format or checksum. Verify the 15-digit code.
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label>Permanent Account Number (PAN)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. AAAAA0000A"
                value={formData.company.pan}
                onChange={(e) => handleCompanyChange('pan', e.target.value.toUpperCase())}
                maxLength={10}
              />
              <span className={styles.hint}>10-character corporate PAN for tax withholding and TDS reconciliation.</span>
              {formData.company.pan && (!PAN_REGEX.test(formData.company.pan) || !validatePAN(formData.company.pan)) && (
                <span className={styles.validationWarning}>
                  <Icon name="alert-circle" size={13} /> Invalid PAN format (must be 10 chars, e.g. AAAAA0000A)
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label>State (Place of Supply Source)</label>
              <select
                className={styles.select}
                value={formData.company.state}
                onChange={(e) => {
                  const selectedState = e.target.value;
                  const code = getStateCode(selectedState);
                  setFormData((prev) => ({
                    ...prev,
                    company: {
                      ...prev.company,
                      state: selectedState,
                      stateCode: code
                    }
                  }));
                }}
              >
                {GST_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name} ({s.code}) — {s.type}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>Used to evaluate whether delivery is intra-state (CGST+SGST) or inter-state (IGST).</span>
            </div>

            <div className={styles.field}>
              <label>GST 2-Digit State Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 07"
                value={formData.company.stateCode}
                onChange={(e) => handleCompanyChange('stateCode', e.target.value)}
                maxLength={2}
              />
              <span className={styles.hint}>Official GST 2-digit numerical prefix (e.g. 07 for Delhi, 27 for Maharashtra).</span>
              {isStateCodeMismatch && (
                <span className={styles.validationWarning}>
                  <Icon name="alert-circle" size={13} /> Mismatch: State code '{formData.company.stateCode}' does not match GSTIN prefix '{gstinPrefix}'
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label>Jurisdiction City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. New Delhi"
                value={formData.company.jurisdictionCity}
                onChange={(e) => handleCompanyChange('jurisdictionCity', e.target.value)}
              />
              <span className={styles.hint}>City printed under dispute terms: "Subject to [City] jurisdiction only".</span>
            </div>

            {/* Subsection 3: Place of Business Address */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>3. Registered Place of Business Address</h3>
              <p className={styles.subSectionDesc}>Principal corporate address printed on all customer invoices and tax returns.</p>
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Address Line 1</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Plot 42, Okhla Industrial Area Phase III"
                value={formData.company.addressLine1}
                onChange={(e) => handleCompanyChange('addressLine1', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Address Line 2 (Optional)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Landmark / Complex / Floor number"
                value={formData.company.addressLine2}
                onChange={(e) => handleCompanyChange('addressLine2', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. New Delhi"
                value={formData.company.city}
                onChange={(e) => handleCompanyChange('city', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Postal Code / PIN (6 digits)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 110020"
                value={formData.company.pincode}
                onChange={(e) => handleCompanyChange('pincode', e.target.value)}
                maxLength={6}
              />
              {formData.company.pincode && !PINCODE_REGEX.test(formData.company.pincode) && (
                <span className={styles.validationWarning}>
                  <Icon name="alert-circle" size={13} /> Must be a 6-digit postal code
                </span>
              )}
            </div>

            {/* Subsection 4: Invoicing Series & Lifecycle */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>4. Invoicing Series & Lifecycle Triggers</h3>
              <p className={styles.subSectionDesc}>Sequential numbering format, credit note series, and issuance triggers.</p>
            </div>

            <div className={styles.field}>
              <label>Tax Invoice Prefix</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. RF"
                value={formData.company.invoicePrefix}
                onChange={(e) => handleCompanyChange('invoicePrefix', e.target.value.toUpperCase())}
              />
              <span className={styles.hint}>Generates format: [Prefix]/YYYY-YY/XXXX (e.g. RF/2026-27/0001).</span>
            </div>

            <div className={styles.field}>
              <label>Credit Note Prefix</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. CN"
                value={formData.company.creditNotePrefix}
                onChange={(e) => handleCompanyChange('creditNotePrefix', e.target.value.toUpperCase())}
              />
              <span className={styles.hint}>Generates format: [Prefix]/YYYY-YY/XXXX (e.g. CN/2026-27/0001).</span>
            </div>

            <div className={styles.field}>
              <label>Invoice Generation Timing</label>
              <select
                className={styles.select}
                value={formData.company.invoiceTiming}
                onChange={(e) => handleCompanyChange('invoiceTiming', e.target.value)}
              >
                <option value="paid">Immediate: Generate when payment is captured/paid</option>
                <option value="dispatch">On Dispatch: Generate when warehouse ships order</option>
              </select>
              <span className={styles.hint}>Defines the automated event that triggers invoice creation.</span>
            </div>

            <div className={styles.field}>
              <label>Default GST Rate (%)</label>
              <select
                className={styles.select}
                value={formData.company.defaultGstRate}
                onChange={(e) => handleCompanyChange('defaultGstRate', Number(e.target.value))}
              >
                <option value={18}>18% (Standard Furniture & Electronics)</option>
                <option value={28}>28% (Luxury / Air Conditioners)</option>
                <option value={12}>12% (Specified Wood Products)</option>
                <option value={5}>5% (Essential Goods)</option>
              </select>
              <span className={styles.hint}>Fallback slab used if a product or service has no explicit rate set.</span>
            </div>

            <div className={styles.field}>
              <label>Delivery / Transport SAC Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="9965"
                value={formData.company.deliverySac}
                onChange={(e) => handleCompanyChange('deliverySac', e.target.value)}
              />
              <span className={styles.hint}>Services Accounting Code for delivery/shipping charges (default 9965).</span>
            </div>

            <div className={styles.field}>
              <label>Installation Service SAC Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="9987"
                value={formData.company.installationSac}
                onChange={(e) => handleCompanyChange('installationSac', e.target.value)}
              />
              <span className={styles.hint}>Services Accounting Code for assembly and installation (default 9987).</span>
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Return &amp; Refund Policy Note</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Returns accepted within 7 days in original packaging..."
                value={formData.company.returnPolicyText}
                onChange={(e) => handleCompanyChange('returnPolicyText', e.target.value)}
              />
              <span className={styles.hint}>Printed under the terms section of generated invoices and credit notes.</span>
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Invoice Terms & Conditions</label>
              <textarea
                className={styles.textarea}
                style={{ minHeight: 70 }}
                placeholder="1. Goods once sold are covered under warranty..."
                value={formData.company.invoiceTerms}
                onChange={(e) => handleCompanyChange('invoiceTerms', e.target.value)}
              />
              <span className={styles.hint}>Printed on the bottom-left of every generated invoice.</span>
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Invoice Footer Note</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Thank you for choosing RF Riddhy..."
                value={formData.company.invoiceFooterNote}
                onChange={(e) => handleCompanyChange('invoiceFooterNote', e.target.value)}
              />
              <span className={styles.hint}>Friendly closing message printed at the footer of receipts.</span>
            </div>

            {/* Subsection 5: Operational & Warehouse Defaults */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>5. Fulfillment Defaults & Finance Contacts</h3>
              <p className={styles.subSectionDesc}>Default warehouse allocation, base currency, and billing contact details.</p>
            </div>

            <div className={styles.field}>
              <label>Default Warehouse Code</label>
              {warehouses.length > 0 ? (
                <select
                  className={styles.select}
                  value={formData.company.defaultWarehouseCode}
                  onChange={(e) => handleCompanyChange('defaultWarehouseCode', e.target.value)}
                >
                  {warehouses.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} — {w.name} ({w.city || 'India'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. DELHI-01"
                  value={formData.company.defaultWarehouseCode}
                  onChange={(e) => handleCompanyChange('defaultWarehouseCode', e.target.value.toUpperCase())}
                />
              )}
              <span className={styles.hint}>Default stocking and dispatch node for newly imported products.</span>
            </div>

            <div className={styles.field}>
              <label>Base Store Currency</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. INR"
                value={formData.company.currency}
                onChange={(e) => handleCompanyChange('currency', e.target.value.toUpperCase())}
                maxLength={3}
              />
              <span className={styles.hint}>Standard 3-letter currency code (INR for Indian Rupee).</span>
            </div>

            <div className={styles.field}>
              <label>Accounts & Billing Phone</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. +91 98765 43210"
                value={formData.company.phone}
                onChange={(e) => handleCompanyChange('phone', e.target.value)}
              />
              <span className={styles.hint}>Official billing grievance number printed on invoices.</span>
            </div>

            <div className={styles.field}>
              <label>Accounts & Billing Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="e.g. billing@rfriddhy.com"
                value={formData.company.email}
                onChange={(e) => handleCompanyChange('email', e.target.value)}
              />
              <span className={styles.hint}>Direct billing and reconciliation desk for vendor / customer invoices.</span>
            </div>

            {/* Subsection 6: Bank Details for Invoice Footer */}
            <div className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>6. Bank Details (Invoice Footer Settlement)</h3>
              <p className={styles.subSectionDesc}>Direct bank transfer and UPI details printed on generated invoices for B2B/NEFT payments.</p>
            </div>

            <div className={styles.field}>
              <label>Bank Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. HDFC Bank Ltd"
                value={formData.company.bankName}
                onChange={(e) => handleCompanyChange('bankName', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Account Number</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 50200012345678"
                value={formData.company.accountNo}
                onChange={(e) => handleCompanyChange('accountNo', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>IFSC Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. HDFC0001234"
                value={formData.company.ifsc}
                onChange={(e) => handleCompanyChange('ifsc', e.target.value.toUpperCase())}
              />
            </div>

            <div className={styles.field}>
              <label>UPI ID (VPA)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. rfriddhy@hdfcbank"
                value={formData.company.upiId}
                onChange={(e) => handleCompanyChange('upiId', e.target.value)}
              />
            </div>
          </div>

          {/* Live Invoice Preview Section */}
          <div className={styles.invoicePreviewSection}>
            <div className={styles.cardHead} style={{ marginBottom: 16 }}>
              <h2>Live GST Invoice Preview</h2>
              <p>Real-time visual rendering of how your seller header, tax breakdown, and footer will appear on official PDF tax invoices.</p>
            </div>

            <div className={styles.invoicePaper}>
              {/* Invoice Header */}
              <div className={styles.previewHeader}>
                <div className={styles.previewSeller}>
                  {formData.company.logoUrl ? (
                    <img
                      src={formData.company.logoUrl}
                      alt="Company Logo"
                      style={{ maxHeight: 40, marginBottom: 8, objectFit: 'contain' }}
                    />
                  ) : (
                    <h3>{formData.company.tradeName || 'RF Riddhy'}</h3>
                  )}
                  <p><strong>{formData.company.legalName || 'RF Riddhy Furniture & Appliances Pvt Ltd'}</strong></p>
                  <p>{formData.company.addressLine1 || <span style={{ color: '#dc2626' }}>[Address Line 1 Required]</span>}{formData.company.addressLine2 ? `, ${formData.company.addressLine2}` : ''}</p>
                  <p>{formData.company.city || 'New Delhi'}, {formData.company.state || 'Delhi'} - {formData.company.pincode || <span style={{ color: '#dc2626' }}>[Pincode Required]</span>}</p>
                  <p>
                    GSTIN: <strong>{formData.company.gstin || <span style={{ color: '#dc2626' }}>[Not Set — Required]</span>}</strong>
                    {' '}| PAN: <strong>{formData.company.pan || <span style={{ color: '#dc2626' }}>[Not Set — Required]</span>}</strong>
                  </p>
                  <p>Phone: {formData.company.phone || '+91 98765 43210'} | Email: {formData.company.email || 'billing@rfriddhy.com'}</p>
                </div>

                <div className={styles.previewDocTitle}>
                  <h4>TAX INVOICE</h4>
                  <span>Original for Recipient</span>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#1b5e20', fontWeight: 800 }}>
                    {formData.company.website || 'https://rfriddhy.com'}
                  </div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className={styles.previewMetaGrid}>
                <div className={styles.previewMetaItem}>
                  <span>Invoice No:</span>
                  <b>{formData.company.invoicePrefix || 'RF'}/2026-27/0042</b>
                </div>
                <div className={styles.previewMetaItem}>
                  <span>Invoice Date:</span>
                  <b>18 Oct 2026</b>
                </div>
                <div className={styles.previewMetaItem}>
                  <span>Place of Supply:</span>
                  <b>{formData.company.state || 'Delhi'} ({formData.company.stateCode || '07'})</b>
                </div>
                <div className={styles.previewMetaItem}>
                  <span>Jurisdiction:</span>
                  <b>{formData.company.jurisdictionCity || 'New Delhi'}</b>
                </div>
              </div>

              {/* Sample Line Item Table */}
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>HSN/SAC</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Taxable Val</th>
                    <th>GST ({formData.company.defaultGstRate || 18}%)</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>RF Solid Teakwood 6-Seater Dining Set</b>
                      <div style={{ fontSize: 9, color: '#777' }}>Natural Honey Finish · SKU: RF-TEAK-DIN-06</div>
                    </td>
                    <td>9403</td>
                    <td>1</td>
                    <td>₹42,372.88</td>
                    <td>₹42,372.88</td>
                    <td>₹7,627.12 (9% CGST + 9% SGST)</td>
                    <td><strong>₹50,000.00</strong></td>
                  </tr>
                  <tr>
                    <td>
                      <b>Standard Assembly &amp; Installation</b>
                      <div style={{ fontSize: 9, color: '#777' }}>White-glove room assembly service</div>
                    </td>
                    <td>{formData.company.installationSac || '9987'}</td>
                    <td>1</td>
                    <td>₹847.46</td>
                    <td>₹847.46</td>
                    <td>₹152.54 (9% CGST + 9% SGST)</td>
                    <td><strong>₹1,000.00</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Footer Grid */}
              <div className={styles.previewFooterGrid}>
                <div>
                  <div className={styles.previewBankBox}>
                    <h5>Bank Details for NEFT / RTGS / IMPS</h5>
                    <p>Bank: <strong>{formData.company.bankName || 'Not configured'}</strong></p>
                    <p>A/C No: <strong>{formData.company.accountNo || 'Not configured'}</strong></p>
                    <p>IFSC: <strong>{formData.company.ifsc || 'Not configured'}</strong></p>
                    <p>UPI ID: <strong>{formData.company.upiId || 'Not configured'}</strong></p>
                  </div>

                  <div className={styles.previewTerms} style={{ marginTop: 12 }}>
                    <h5>Terms &amp; Conditions (Subject to {formData.company.jurisdictionCity || 'New Delhi'} jurisdiction):</h5>
                    <p style={{ whiteSpace: 'pre-line' }}>{formData.company.invoiceTerms || '1. Goods once sold are covered under warranty.'}</p>
                    {formData.company.returnPolicyText && (
                      <p style={{ marginTop: 4, fontWeight: 600, color: '#1b5e20' }}>
                        Return Policy: {formData.company.returnPolicyText}
                      </p>
                    )}
                    <p style={{ marginTop: 6, fontStyle: 'italic' }}>{formData.company.invoiceFooterNote}</p>
                  </div>
                </div>

                <div className={styles.previewSignatory}>
                  {formData.company.signatureUrl ? (
                    <img
                      src={formData.company.signatureUrl}
                      alt="Digital Signature"
                      style={{ maxHeight: 45, marginBottom: 4, objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ height: 35 }} />
                  )}
                  <span>For {formData.company.tradeName || 'RF Riddhy'}</span>
                  <b>Authorized Signatory</b>
                  <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>
                    Computer Generated Tax Invoice
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
              <span className={styles.hint}>Shown on Contact page and customer care desk.</span>
            </div>

            <div className={styles.field}>
              <label>Operating Hours</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Mon - Sat, 10:00 AM - 7:30 PM"
                value={formData.contact.hours}
                onChange={(e) => handleContactChange('hours', e.target.value)}
              />
              <span className={styles.hint}>When customer support agents are live.</span>
            </div>

            <div className={styles.field}>
              <label>Holidays & Maintenance Notice</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Closed on National Holidays and Diwali"
                value={formData.contact.holidaysNotice}
                onChange={(e) => handleContactChange('holidaysNotice', e.target.value)}
              />
              <span className={styles.hint}>Banner message displayed during off-days.</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Showroom & Hours */}
      {activeTab === 'showroom' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Experience Showroom Location & Hours</h2>
            <p>
              Leave the address blank to conceal showroom visit booking from the Consultation form
              and store pages until the physical store officially opens.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Showroom Display Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="RF Riddhy Experience Store"
                value={formData.showroom.name}
                onChange={(e) => handleShowroomChange('name', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Visiting Hours</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Daily 10:30 AM - 8:30 PM (Closed Tuesday)"
                value={formData.showroom.hours}
                onChange={(e) => handleShowroomChange('hours', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Street Address Line 1</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 1st Floor, Design Galleria, Linking Road"
                value={formData.showroom.addressLine1}
                onChange={(e) => handleShowroomChange('addressLine1', e.target.value)}
              />
              <span className={styles.hint}>Leave empty if the physical showroom is not currently open to visitors.</span>
            </div>

            <div className={styles.field}>
              <label>City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Mumbai"
                value={formData.showroom.city}
                onChange={(e) => handleShowroomChange('city', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>State</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Maharashtra"
                value={formData.showroom.state}
                onChange={(e) => handleShowroomChange('state', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Pincode</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 400050"
                value={formData.showroom.pincode}
                onChange={(e) => handleShowroomChange('pincode', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Google Maps Directions URL</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://maps.google.com/?q=..."
                value={formData.showroom.mapUrl}
                onChange={(e) => handleShowroomChange('mapUrl', e.target.value)}
              />
              <span className={styles.hint}>Powers the 'Open in Maps' link on the Contact page.</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Consultation Rules */}
      {activeTab === 'consultation' && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Consultation Booking Rules</h2>
            <p>
              Tune designer availability, capacity caps per calendar slot, and home visit eligibility.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Capacity per Time Slot</label>
              <input
                type="number"
                min="1"
                max="20"
                className={styles.input}
                value={formData.consultation.capacityPerSlot}
                onChange={(e) => handleConsultationChange('capacityPerSlot', Number(e.target.value) || 1)}
              />
              <span className={styles.hint}>
                Maximum simultaneous appointments accepted for any 60-minute window (1 - 20 designers).
              </span>
            </div>

            <div className={styles.field} style={{ justifyContent: 'center' }}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <b>Allow Home Visit Consultations</b>
                  <span>When enabled, customers can select 'In-Home Design Visit' on the booking form.</span>
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
            <h2>Brand Story & Social Proof</h2>
            <p>
              Verified narrative and metrics displayed on the About page and trust strips across the storefront.
            </p>
          </div>

          <div className={styles.grid2}>
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
                placeholder="e.g. Jodhpur, Rajasthan"
                value={formData.story.originCity}
                onChange={(e) => handleStoryChange('originCity', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.gridFull}`}>
              <label>Founder Narrative</label>
              <textarea
                className={styles.textarea}
                placeholder="Tell the authentic story of how RF Riddhy started, crafting heirloom teakwood furniture and premium appliances..."
                value={formData.story.founderNarrative}
                onChange={(e) => handleStoryChange('founderNarrative', e.target.value)}
              />
              <span className={styles.hint}>Displays in the prominent founder block on the About Us page.</span>
            </div>

            <div className={styles.field}>
              <label>Metric: Homes Furnished</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 12,500+"
                value={formData.story.metrics.homesFurnished}
                onChange={(e) => handleMetricChange('homesFurnished', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Metric: Pincodes Served</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 19,000+"
                value={formData.story.metrics.pincodesServed}
                onChange={(e) => handleMetricChange('pincodesServed', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Metric: Customer Satisfaction Rate</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 98.4%"
                value={formData.story.metrics.satisfactionRate}
                onChange={(e) => handleMetricChange('satisfactionRate', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Partner Appliance Brands</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Bosch, Siemens, Faber, Hafele, Kaff"
                value={formData.story.partnerBrands}
                onChange={(e) => handleStoryChange('partnerBrands', e.target.value)}
              />
              <span className={styles.hint}>Comma-separated list of certified appliance brand partners.</span>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Actions Bar */}
      <div className={styles.actionsBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isDirty && (
            <span style={{ fontSize: 12, color: '#b78103', fontWeight: 700 }}>
              ● You have unsaved changes
            </span>
          )}
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.saveBtn}
            disabled={isSaving || !isDirty}
            onClick={handleSave}
          >
            {isSaving ? 'Saving changes…' : 'Save Changes'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleReset}
            disabled={isSaving || !isDirty}
          >
            Reset
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
