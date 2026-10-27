'use client';

import styles from '../AdminSettings.module.css';

export default function ConsultationTab({ formData, updateField, fieldErrors }) {
  const consultation = formData.consultation;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Consultation Capacity & In-Home Booking Rules</h2>
        <p>
          Configure how many concurrent consultations interior designers and appliance specialists
          can accept per time window on the storefront `/consultation` booking page.
        </p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="cs-capacity">Max Bookings Allowed Per Slot</label>
          <input
            id="cs-capacity"
            type="number"
            min={1}
            max={20}
            className={styles.input}
            value={consultation.capacityPerSlot}
            onChange={(e) => updateField('consultation', 'capacityPerSlot', Math.max(1, parseInt(e.target.value) || 1))}
          />
          <small className={styles.helpText}>Slots automatically lock when capacity is reached.</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="cs-homevisit">In-Home Space Planning Visits</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}>
              <input
                id="cs-homevisit"
                type="checkbox"
                checked={Boolean(consultation.homeVisit)}
                onChange={(e) => updateField('consultation', 'homeVisit', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--rf-green-800)' }}
              />
              Enable Doorstep Space Measurements & In-Home Visits
            </label>
          </div>
          <small className={styles.helpText}>Allows customers to choose 'Home Visit' in consultation forms.</small>
        </div>
      </div>
    </section>
  );
}
