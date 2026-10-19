'use client';

import styles from '../AdminSettings.module.css';

export default function ShowroomTab({ formData, updateField, fieldErrors = {} }) {
  const showroom = formData.showroom;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Experience Centre & Flagship Showroom</h2>
        <p>
          Configure the public physical showroom location displayed on the Contact Us,
          About page, consultation scheduling confirmations, and LocalBusiness structured data.
        </p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="sr-name">Showroom / Experience Centre Name</label>
          <input
            id="sr-name"
            className={styles.input}
            value={showroom.name}
            onChange={(e) => updateField('showroom', 'name', e.target.value)}
            placeholder="RF Riddhy Design Studio & Showroom"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sr-addr1">Physical Address Line</label>
          <input
            id="sr-addr1"
            className={styles.input}
            value={showroom.addressLine1}
            onChange={(e) => updateField('showroom', 'addressLine1', e.target.value)}
            placeholder="Ring Road, Sector 14"
          />
        </div>
      </div>

      <div className={styles.grid3} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="sr-city">City</label>
          <input
            id="sr-city"
            className={styles.input}
            value={showroom.city}
            onChange={(e) => updateField('showroom', 'city', e.target.value)}
            placeholder="New Delhi"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sr-state">State</label>
          <input
            id="sr-state"
            className={styles.input}
            value={showroom.state}
            onChange={(e) => updateField('showroom', 'state', e.target.value)}
            placeholder="Delhi"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sr-pincode">Pincode</label>
          <input
            id="sr-pincode"
            className={`${styles.input} ${fieldErrors['showroom.pincode'] ? styles.inputError : ''}`}
            value={showroom.pincode}
            onChange={(e) => updateField('showroom', 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="110001"
            maxLength={6}
          />
          {fieldErrors['showroom.pincode'] && (
            <span className={styles.errorText}>{fieldErrors['showroom.pincode']}</span>
          )}
        </div>
      </div>

      <div className={styles.grid2} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label htmlFor="sr-hours">Visiting Hours (Showroom Walk-in)</label>
          <input
            id="sr-hours"
            className={styles.input}
            value={showroom.hours}
            onChange={(e) => updateField('showroom', 'hours', e.target.value)}
            placeholder="10:30 AM – 8:30 PM (Tuesday – Sunday)"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sr-map">Google Maps Location / Embed URL</label>
          <input
            id="sr-map"
            className={styles.input}
            value={showroom.mapUrl}
            onChange={(e) => updateField('showroom', 'mapUrl', e.target.value)}
            placeholder="https://maps.google.com/?q=..."
          />
        </div>
      </div>
    </section>
  );
}
