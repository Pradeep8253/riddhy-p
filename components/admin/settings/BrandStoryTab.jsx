'use client';

import styles from '../AdminSettings.module.css';

export default function BrandStoryTab({ formData, updateField, updateStoryMetric, fieldErrors }) {
  const story = formData.story;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Brand Story, Heritage & Verified Proof Metrics</h2>
        <p>
          Update the founder narrative, company origins, and customer trust proof points
          rendered on the `/about` brand page and trust strip.
        </p>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="st-year">Founded Year</label>
          <input
            id="st-year"
            className={styles.input}
            value={story.foundedYear}
            onChange={(e) => updateField('story', 'foundedYear', e.target.value)}
            placeholder="2018"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="st-city">Origin City / Workshop Location</label>
          <input
            id="st-city"
            className={styles.input}
            value={story.originCity}
            onChange={(e) => updateField('story', 'originCity', e.target.value)}
            placeholder="Kolkata / New Delhi"
          />
        </div>
      </div>

      <div className={styles.field} style={{ marginTop: 14 }}>
        <label htmlFor="st-narrative">Founder's Narrative & Mission Statement</label>
        <textarea
          id="st-narrative"
          rows={4}
          className={styles.textarea}
          value={story.founderNarrative}
          onChange={(e) => updateField('story', 'founderNarrative', e.target.value)}
          placeholder="Our journey began with a vision to deliver genuine solid-wood craftsmanship..."
        />
      </div>

      <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
        <h4>Verified Storefront Proof Metrics</h4>
      </div>

      <div className={styles.grid3}>
        <div className={styles.field}>
          <label htmlFor="st-metric-homes">Homes Furnished</label>
          <input
            id="st-metric-homes"
            className={styles.input}
            value={story.metrics?.homesFurnished}
            onChange={(e) => updateStoryMetric('homesFurnished', e.target.value)}
            placeholder="12,500+"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="st-metric-pins">Pincodes Served</label>
          <input
            id="st-metric-pins"
            className={styles.input}
            value={story.metrics?.pincodesServed}
            onChange={(e) => updateStoryMetric('pincodesServed', e.target.value)}
            placeholder="450+"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="st-metric-sat">Customer Satisfaction Rate</label>
          <input
            id="st-metric-sat"
            className={styles.input}
            value={story.metrics?.satisfactionRate}
            onChange={(e) => updateStoryMetric('satisfactionRate', e.target.value)}
            placeholder="98.6%"
          />
        </div>
      </div>

      <div className={styles.field} style={{ marginTop: 18 }}>
        <label htmlFor="st-brands">Partner Brands (Comma-separated)</label>
        <input
          id="st-brands"
          className={styles.input}
          value={story.partnerBrands}
          onChange={(e) => updateField('story', 'partnerBrands', e.target.value)}
          placeholder="Samsung, LG, Bosch, Godrej, Philips, Whirlpool"
        />
        <small className={styles.helpText}>Displayed on storefront homepage and appliance product pages.</small>
      </div>
    </section>
  );
}
