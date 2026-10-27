'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { GST_STATES, getStateCode } from '@/lib/gst-states';
import styles from '../AdminSettings.module.css';

export default function CompanyBillingTab({ formData, updateField, fieldErrors = {}, warehouses, companyValidation }) {
  const comp = formData.company;
  const [showFullAccount, setShowFullAccount] = useState(false);

  const handleStateChange = (newState) => {
    updateField('company', 'state', newState);
    const code = getStateCode(newState);
    updateField('company', 'stateCode', code);
  };

  const handleGstinChange = (newGstin) => {
    const clean = newGstin.toUpperCase().trim();
    updateField('company', 'gstin', clean);

    // Auto-extract PAN from characters 3 to 12 of GSTIN (e.g. 29ABCDE1234F1Z5 -> ABCDE1234F)
    if (clean.length >= 12) {
      const extractedPan = clean.slice(2, 12);
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(extractedPan)) {
        updateField('company', 'pan', extractedPan);
      }
    }
  };

  const maskAccountNo = (acc) => {
    if (!acc) return '';
    if (acc.length <= 4) return acc;
    return '••••••••' + acc.slice(-4);
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Company Legal Identity & Invoicing Rules</h2>
        <p>
          These values configure your seller profile for sequential GST invoices, credit notes,
          statutory tax place-of-supply determination, and warehouse dispatch fulfillment.
        </p>
      </div>

      {/* Validation status alert */}
      {!companyValidation.valid && (
        <div className={`${styles.alert} ${styles.alertError}`} style={{ marginBottom: 20 }}>
          <div>
            <b>Statutory Invoicing Incomplete:</b> {companyValidation.errors?.join(' ')}
          </div>
        </div>
      )}

      {/* Identity block */}
      <div className={styles.sectionDivider}>
        <h4>1. Business Credentials & Tax Registration</h4>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="comp-legalName">
            Legal Registered Name <span>*</span>
          </label>
          <input
            id="comp-legalName"
            className={`${styles.input} ${fieldErrors['company.legalName'] ? styles.inputError : ''}`}
            value={comp.legalName}
            onChange={(e) => updateField('company', 'legalName', e.target.value)}
            placeholder="e.g. RF Riddhy Furniture & Appliances Pvt Ltd"
          />
          {fieldErrors['company.legalName'] && (
            <span className={styles.errorText}>{fieldErrors['company.legalName']}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-tradeName">
            Trade Name / Brand Wordmark <span>*</span>
          </label>
          <input
            id="comp-tradeName"
            className={`${styles.input} ${fieldErrors['company.tradeName'] ? styles.inputError : ''}`}
            value={comp.tradeName}
            onChange={(e) => updateField('company', 'tradeName', e.target.value)}
            placeholder="e.g. RF Riddhy"
          />
          {fieldErrors['company.tradeName'] && (
            <span className={styles.errorText}>{fieldErrors['company.tradeName']}</span>
          )}
        </div>
      </div>

      <div className={styles.grid3} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="comp-gstin">
            GSTIN (15 Alphanumeric) <span>*</span>
          </label>
          <input
            id="comp-gstin"
            className={`${styles.input} ${fieldErrors['company.gstin'] ? styles.inputError : ''}`}
            value={comp.gstin}
            onChange={(e) => handleGstinChange(e.target.value)}
            placeholder="e.g. 27AAPFU0939F1ZV"
            maxLength={15}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          {fieldErrors['company.gstin'] && (
            <span className={styles.errorText}>{fieldErrors['company.gstin']}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-pan">
            Company PAN (10 chars) <span>*</span>
          </label>
          <input
            id="comp-pan"
            className={`${styles.input} ${fieldErrors['company.pan'] ? styles.inputError : ''}`}
            value={comp.pan}
            onChange={(e) => updateField('company', 'pan', e.target.value.toUpperCase())}
            placeholder="e.g. AAPFU0939F"
            maxLength={10}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          {fieldErrors['company.pan'] && (
            <span className={styles.errorText}>{fieldErrors['company.pan']}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-jurisdictionCity">Jurisdiction City (Legal Venue)</label>
          <input
            id="comp-jurisdictionCity"
            className={styles.input}
            value={comp.jurisdictionCity}
            onChange={(e) => updateField('company', 'jurisdictionCity', e.target.value)}
            placeholder="e.g. New Delhi"
          />
        </div>
      </div>

      {/* Address Block */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>2. Registered Seller Address & Place of Supply</h4>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="comp-addr1">Address Line 1 <span>*</span></label>
          <input
            id="comp-addr1"
            className={styles.input}
            value={comp.addressLine1}
            onChange={(e) => updateField('company', 'addressLine1', e.target.value)}
            placeholder="Mansoorabad"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-addr2">Address Line 2</label>
          <input
            id="comp-addr2"
            className={styles.input}
            value={comp.addressLine2}
            onChange={(e) => updateField('company', 'addressLine2', e.target.value)}
            placeholder="Landmark (Optional)"
          />
        </div>
      </div>

      <div className={styles.grid3} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="comp-city">City / District <span>*</span></label>
          <input
            id="comp-city"
            className={styles.input}
            value={comp.city}
            onChange={(e) => updateField('company', 'city', e.target.value)}
            placeholder="Prayagraj"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-state">State / UT <span>*</span></label>
          <select
            id="comp-state"
            className={styles.select}
            value={comp.state}
            onChange={(e) => handleStateChange(e.target.value)}
          >
            {GST_STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.code} - {s.name} ({s.type})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-pincode">Postal Pincode (6 digits) <span>*</span></label>
          <input
            id="comp-pincode"
            className={`${styles.input} ${fieldErrors['company.pincode'] ? styles.inputError : ''}`}
            value={comp.pincode}
            onChange={(e) => updateField('company', 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="229411"
            maxLength={6}
          />
          {fieldErrors['company.pincode'] && (
            <span className={styles.errorText}>{fieldErrors['company.pincode']}</span>
          )}
        </div>
      </div>

      {/* Store Contact & Helpline */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>3. Store Helplines & Prayagraj Customer Care</h4>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="comp-phone">Store Phone / Landline</label>
          <input
            id="comp-phone"
            className={styles.input}
            value={comp.phone || ''}
            onChange={(e) => {
              updateField('company', 'phone', e.target.value);
              updateField('contact', 'phone', e.target.value);
            }}
            placeholder="+91 88402 45188"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-whatsapp">WhatsApp Support Number</label>
          <input
            id="contact-whatsapp"
            className={styles.input}
            value={formData.contact?.whatsapp || ''}
            onChange={(e) => updateField('contact', 'whatsapp', e.target.value)}
            placeholder="+91 88402 45188"
          />
        </div>
      </div>

      <div className={styles.grid2} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="comp-email">Store Email Address</label>
          <input
            id="comp-email"
            type="email"
            className={styles.input}
            value={comp.email || ''}
            onChange={(e) => {
              updateField('company', 'email', e.target.value);
              updateField('contact', 'email', e.target.value);
            }}
            placeholder="riddhyfurnitureshomeappliances@gmail.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-hours">Store Working Hours</label>
          <input
            id="contact-hours"
            className={styles.input}
            value={formData.contact?.hours || ''}
            onChange={(e) => updateField('contact', 'hours', e.target.value)}
            placeholder="10:00 AM – 8:30 PM (Open 7 Days)"
          />
        </div>
      </div>

      {/* Sequencing & Accounting */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>4. Sequential Invoice & Accounting Parameters</h4>
      </div>

      <div className={styles.grid3}>
        <div className={styles.field}>
          <label htmlFor="comp-invPrefix">Invoice Prefix (Series)</label>
          <input
            id="comp-invPrefix"
            className={styles.input}
            value={comp.invoicePrefix}
            onChange={(e) => updateField('company', 'invoicePrefix', e.target.value.toUpperCase())}
            placeholder="RF"
            maxLength={6}
          />
          <small className={styles.helpText}>Produces RF/2026-27/000001</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-cnPrefix">Credit Note Prefix</label>
          <input
            id="comp-cnPrefix"
            className={styles.input}
            value={comp.creditNotePrefix}
            onChange={(e) => updateField('company', 'creditNotePrefix', e.target.value.toUpperCase())}
            placeholder="CN"
            maxLength={6}
          />
          <small className={styles.helpText}>Produces CN/2026-27/000001</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-warehouse">Default Dispatch Depot</label>
          <select
            id="comp-warehouse"
            className={styles.select}
            value={comp.defaultWarehouseCode}
            onChange={(e) => updateField('company', 'defaultWarehouseCode', e.target.value)}
          >
            {warehouses.length > 0 ? (
              warehouses.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.name} ({w.city})
                </option>
              ))
            ) : (
              <option value="DELHI-01">DELHI-01 — Central North Depot (Delhi)</option>
            )}
          </select>
        </div>
      </div>

      {/* Banking & Settlement */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>5. Bank Account Details & Settlement UPI (Printed on Invoices)</h4>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="comp-bankName">Beneficiary Bank Name</label>
          <input
            id="comp-bankName"
            className={styles.input}
            value={comp.bankName}
            onChange={(e) => updateField('company', 'bankName', e.target.value)}
            placeholder="e.g. HDFC Bank Ltd"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-accountNo">
            Account Number
            <button
              type="button"
              className={styles.revealBtn}
              onClick={() => setShowFullAccount(!showFullAccount)}
            >
              {showFullAccount ? 'Mask' : 'Reveal'}
            </button>
          </label>
          <input
            id="comp-accountNo"
            className={styles.input}
            value={showFullAccount ? comp.accountNo : maskAccountNo(comp.accountNo)}
            onChange={(e) => updateField('company', 'accountNo', e.target.value)}
            placeholder="50200012345678"
          />
        </div>
      </div>

      <div className={styles.grid2} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="comp-ifsc">IFSC Code</label>
          <input
            id="comp-ifsc"
            className={styles.input}
            value={comp.ifsc}
            onChange={(e) => updateField('company', 'ifsc', e.target.value.toUpperCase())}
            placeholder="HDFC0000123"
            maxLength={11}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-upi">UPI VPA (QR Code Destination)</label>
          <input
            id="comp-upi"
            className={styles.input}
            value={comp.upiId}
            onChange={(e) => updateField('company', 'upiId', e.target.value)}
            placeholder="rfriddhy@hdfcbank"
          />
        </div>
      </div>

      {/* SAC & Tax Slabs */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>6. Statutory GST Rates & Service Accounting Codes (SAC)</h4>
      </div>

      <div className={styles.grid3}>
        <div className={styles.field}>
          <label htmlFor="comp-defaultGstRate">Default Product GST Slab (%)</label>
          <select
            id="comp-defaultGstRate"
            className={styles.select}
            value={comp.defaultGstRate}
            onChange={(e) => updateField('company', 'defaultGstRate', Number(e.target.value))}
          >
            <option value={5}>5% (Essential furniture/textiles)</option>
            <option value={12}>12% (Standard wooden furniture)</option>
            <option value={18}>18% (Standard appliances & furniture)</option>
            <option value={28}>28% (Air conditioners & luxury)</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-deliverySac">Delivery Service SAC Code</label>
          <input
            id="comp-deliverySac"
            className={styles.input}
            value={comp.deliverySac}
            onChange={(e) => updateField('company', 'deliverySac', e.target.value)}
            placeholder="9965"
          />
          <small className={styles.helpText}>SAC 9965 attracts 18% GST</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="comp-installSac">Installation Service SAC Code</label>
          <input
            id="comp-installSac"
            className={styles.input}
            value={comp.installationSac}
            onChange={(e) => updateField('company', 'installationSac', e.target.value)}
            placeholder="9987"
          />
          <small className={styles.helpText}>SAC 9987 attracts 18% GST</small>
        </div>
      </div>

      {/* Policies & Legal Terms */}
      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>7. Terms, Return Policies & Signatory URL</h4>
      </div>

      <div className={styles.field}>
        <label htmlFor="comp-invoiceTerms">Statutory Invoice Terms & Conditions</label>
        <textarea
          id="comp-invoiceTerms"
          rows={3}
          className={styles.textarea}
          value={comp.invoiceTerms}
          onChange={(e) => updateField('company', 'invoiceTerms', e.target.value)}
        />
      </div>

      <div className={styles.field} style={{ marginTop: 14 }}>
        <label htmlFor="comp-returnPolicy">Customer Return Policy Summary (Printed on Invoice)</label>
        <textarea
          id="comp-returnPolicy"
          rows={2}
          className={styles.textarea}
          value={comp.returnPolicyText}
          onChange={(e) => updateField('company', 'returnPolicyText', e.target.value)}
        />
      </div>

      {/* Live Preview Card */}
      <div className={styles.previewContainer} style={{ marginTop: 32 }}>
        <div className={styles.previewHeader}>
          <Icon name="fileText" size={16} />
          <span>Live Statutory Invoice Preview (Reactive)</span>
        </div>
        <div className={styles.previewPaper}>
          <div className={styles.previewTop}>
            <div>
              <h3>{comp.tradeName || 'RF RIDDHY'}</h3>
              <p className={styles.previewLegal}>{comp.legalName}</p>
              <p>{comp.addressLine1} {comp.addressLine2}</p>
              <p>{comp.city}, {comp.state} — {comp.pincode}</p>
              <p><b>GSTIN:</b> {comp.gstin || 'NOT CONFIGURED'} | <b>PAN:</b> {comp.pan || 'NOT CONFIGURED'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', margin: '0 0 4px', color: '#10261a' }}>TAX INVOICE</h4>
              <p><b>Invoice No:</b> {comp.invoicePrefix || 'RF'}/2026-27/000142</p>
              <p><b>Place of Supply:</b> {comp.state} ({comp.stateCode})</p>
              <p><b>Disputes:</b> {comp.jurisdictionCity || comp.city} Jurisdiction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
