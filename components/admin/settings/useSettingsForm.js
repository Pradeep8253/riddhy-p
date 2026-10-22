'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { validateGSTIN, validatePAN } from '@/config/gstConfig';

const PINCODE_REGEX = /^\d{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_SETTINGS = {
  company: {
    legalName: 'RF Riddhy Furniture & Appliances',
    tradeName: 'RF Riddhy',
    gstin: '09AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    state: 'Uttar Pradesh',
    stateCode: '09',
    jurisdictionCity: 'Prayagraj',
    addressLine1: 'Civil Lines, MG Marg',
    addressLine2: 'Near Subhash Chauraha',
    city: 'Prayagraj',
    pincode: '211001',
    phone: '+91 99342 08035',
    email: 'care@riddhy.in',
    invoicePrefix: 'RF',
    creditNotePrefix: 'CN',
    invoiceTiming: 'paid',
    defaultWarehouseCode: 'PRAYAGRAJ-01',
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
    invoiceTerms: '1. Goods once sold are covered under RF Riddhy Care Warranty Policy.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. All disputes subject to Prayagraj jurisdiction.',
    invoiceFooterNote: 'Thank you for choosing RF Riddhy. For support & warranty, email care@riddhy.in or WhatsApp +91 99342 08035. Delivery & installation in Prayagraj.',
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
};

export function useSettingsForm() {
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [source, setSource] = useState('database');
  const [warehouses, setWarehouses] = useState([]);
  const [companyValidation, setCompanyValidation] = useState({ valid: true, errors: [] });
  const [fieldErrors, setFieldErrors] = useState({});

  const initialDataRef = useRef(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
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
            state: comp.state || 'Uttar Pradesh',
            stateCode: comp.stateCode || '09',
            jurisdictionCity: comp.jurisdictionCity || 'Prayagraj',
            addressLine1: comp.addressLine1 || 'Civil Lines, MG Marg',
            addressLine2: comp.addressLine2 || '',
            city: comp.city || 'Prayagraj',
            pincode: comp.pincode || '211001',
            phone: comp.phone || '+91 99342 08035',
            email: comp.email || 'care@riddhy.in',
            invoicePrefix: comp.invoicePrefix || 'RF',
            creditNotePrefix: comp.creditNotePrefix || 'CN',
            invoiceTiming: comp.invoiceTiming || 'paid',
            defaultWarehouseCode: comp.defaultWarehouseCode || 'PRAYAGRAJ-01',
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
            returnPolicyText: comp.returnPolicyText || DEFAULT_SETTINGS.company.returnPolicyText,
            invoiceTerms: comp.invoiceTerms || DEFAULT_SETTINGS.company.invoiceTerms,
            invoiceFooterNote: comp.invoiceFooterNote || DEFAULT_SETTINGS.company.invoiceFooterNote,
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
    } catch {
      setToast({ type: 'error', message: 'Failed to load store settings.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dirty detection
  const isDirty = initialDataRef.current !== null && JSON.stringify(formData) !== initialDataRef.current;

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Field updater
  const updateField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear inline error when field is updated
    const errorKey = `${section}.${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const updateStoryMetric = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        metrics: {
          ...prev.story.metrics,
          [field]: value
        }
      }
    }));
  };

  // Inline Validation
  const validateForm = () => {
    const errors = {};

    // Company Validations
    if (!formData.company.legalName?.trim()) {
      errors['company.legalName'] = 'Legal registered name is required.';
    }

    if (!formData.company.tradeName?.trim()) {
      errors['company.tradeName'] = 'Trade / Operating name is required.';
    }

    if (formData.company.gstin?.trim()) {
      if (!validateGSTIN(formData.company.gstin)) {
        errors['company.gstin'] = 'Invalid Indian GSTIN format (e.g. 09ABCDE1234F1Z5).';
      }
    }

    if (formData.company.pan?.trim() && !validatePAN(formData.company.pan)) {
      errors['company.pan'] = 'Invalid 10-digit PAN format (e.g. AABCR1234F).';
    }

    if (formData.company.pincode?.trim() && !PINCODE_REGEX.test(formData.company.pincode)) {
      errors['company.pincode'] = 'Pincode must be exactly 6 digits.';
    }

    if (formData.company.email?.trim() && !EMAIL_REGEX.test(formData.company.email.trim())) {
      errors['company.email'] = 'Valid billing email is required.';
    }

    if (formData.company.phone?.trim() && formData.company.phone.trim().replace(/\D/g, '').length < 8) {
      errors['company.phone'] = 'Company phone must be at least 8 digits.';
    }

    // Showroom Validations
    if (formData.showroom.pincode?.trim() && !PINCODE_REGEX.test(formData.showroom.pincode)) {
      errors['showroom.pincode'] = 'Showroom pincode must be exactly 6 digits.';
    }

    // Contact / Support Validations
    if (formData.contact.email?.trim() && !EMAIL_REGEX.test(formData.contact.email.trim())) {
      errors['contact.email'] = 'Valid customer support email is required.';
    }

    if (formData.contact.phone?.trim() && formData.contact.phone.trim().replace(/\D/g, '').length < 8) {
      errors['contact.phone'] = 'Support hotline must be at least 8 digits.';
    }

    if (formData.contact.whatsapp?.trim() && formData.contact.whatsapp.trim().replace(/\D/g, '').length < 8) {
      errors['contact.whatsapp'] = 'WhatsApp number must be at least 8 digits.';
    }

    setFieldErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Save handler
  const handleSave = async (e) => {
    e?.preventDefault();
    const validation = validateForm();
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setToast({ type: 'error', message: firstError || 'Please fix the inline errors before saving.' });
      return false;
    }

    setIsSaving(true);
    setToast(null);

    try {
      // 1. Save company settings specifically
      const companySaveRes = await fetch('/api/admin/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.company)
      });

      const companyData = await companySaveRes.json();
      if (!companySaveRes.ok || !companyData.success) {
        setToast({
          type: 'error',
          message: companyData.error?.message || 'Validation error in Company Settings.'
        });
        setIsSaving(false);
        return false;
      }

      // 2. Save full settings payload
      const payload = {
        company: formData.company,
        contact: formData.contact,
        showroom: formData.showroom,
        consultation: formData.consultation,
        story: {
          ...formData.story,
          partnerBrands: (formData.story.partnerBrands || '')
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
        setIsSaving(false);
        return true;
      } else {
        setToast({ type: 'error', message: data.error?.message || 'Failed to save settings.' });
        setIsSaving(false);
        return false;
      }
    } catch {
      setToast({ type: 'error', message: 'Network or database error while saving settings.' });
      setIsSaving(false);
      return false;
    }
  };

  // Revert changes
  const handleReset = () => {
    if (initialDataRef.current) {
      setFormData(JSON.parse(initialDataRef.current));
      setFieldErrors({});
      setToast({ type: 'warning', message: 'Reverted all unsaved modifications.' });
    }
  };

  return {
    formData,
    setFormData,
    fieldErrors,
    isLoading,
    isSaving,
    isDirty,
    toast,
    setToast,
    source,
    warehouses,
    companyValidation,
    updateField,
    updateStoryMetric,
    handleSave,
    handleReset,
    refetch: fetchSettings
  };
}
