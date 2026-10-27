'use client';

import styles from '../AdminSettings.module.css';

export default function StoreSupportTab({ formData, updateField, fieldErrors = {} }) {
  const contact = formData.contact;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Store Customer Care & Helpdesk Desks</h2>
        <p>
          Configure verified contact points shown on the storefront header, footer,
          order confirmation emails, and customer tracking pages.
        </p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="care-phone">Customer Care Hotline</label>
          <input
            id="care-phone"
            className={`${styles.input} ${fieldErrors['contact.phone'] ? styles.inputError : ''}`}
            value={contact.phone}
            onChange={(e) => updateField('contact', 'phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
          {fieldErrors['contact.phone'] && (
            <span className={styles.errorText}>{fieldErrors['contact.phone']}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="care-whatsapp">WhatsApp Support Number</label>
          <input
            id="care-whatsapp"
            className={`${styles.input} ${fieldErrors['contact.whatsapp'] ? styles.inputError : ''}`}
            value={contact.whatsapp}
            onChange={(e) => updateField('contact', 'whatsapp', e.target.value)}
            placeholder="+91 88402 45188"
          />
          {fieldErrors['contact.whatsapp'] && (
            <span className={styles.errorText}>{fieldErrors['contact.whatsapp']}</span>
          )}
        </div>
      </div>

      <div className={styles.grid2} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="care-email">Support Email Address</label>
          <input
            id="care-email"
            type="email"
            className={`${styles.input} ${fieldErrors['contact.email'] ? styles.inputError : ''}`}
            value={contact.email}
            onChange={(e) => updateField('contact', 'email', e.target.value)}
            placeholder="riddhyfurnitureshomeappliances@gmail.com"
          />
          {fieldErrors['contact.email'] && (
            <span className={styles.errorText}>{fieldErrors['contact.email']}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="care-responseTime">Response Time SLA Commitment</label>
          <input
            id="care-responseTime"
            className={styles.input}
            value={contact.responseTime}
            onChange={(e) => updateField('contact', 'responseTime', e.target.value)}
            placeholder="Under 2 Hours (Mon-Sat)"
          />
        </div>
      </div>

      <div className={styles.grid2} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="care-hours">Support Operating Hours</label>
          <input
            id="care-hours"
            className={styles.input}
            value={contact.hours}
            onChange={(e) => updateField('contact', 'hours', e.target.value)}
            placeholder="10:00 AM – 8:00 PM IST (Daily)"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="care-holidays">Holiday Notices / Dispatch Advisories</label>
          <input
            id="care-holidays"
            className={styles.input}
            value={contact.holidaysNotice}
            onChange={(e) => updateField('contact', 'holidaysNotice', e.target.value)}
            placeholder="Closed on National Holidays (Diwali, Independence Day)"
          />
        </div>
      </div>
    </section>
  );
}
