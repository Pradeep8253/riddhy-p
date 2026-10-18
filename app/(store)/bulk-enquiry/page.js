import BulkEnquiryForm from '@/components/commerce/BulkEnquiryForm';
import styles from './bulk.module.css';

export const metadata = {
  title: 'Trade & Bulk Enquiries — RF Riddhy Commercial Desk',
  description: 'Furnishing a hotel, workspace, rental property, or multi-unit project? Request a considered B2B trade quote with volume discounts and GST input credit.'
};

export default function BulkEnquiryPage() {
  return (
    <main className="container">
      <section className={styles.page}>
        <div className={styles.copy}>
          <span className="kicker">Enterprise · Hospitality · Projects</span>
          <h1>
            Furnishing a little<br />
            <em>more room?</em>
          </h1>
          <p>
            For corporate workspaces, boutique hotels, co-living properties, and turnkey builder setups — share your product mix, volume, and target timeline. Our commercial desk will prepare an itemized proforma with tiered volume pricing.
          </p>

          <div className={styles.points}>
            <div className={styles.pointItem}>
              <span>Comprehensive Furniture & Appliance mix</span>
            </div>
            <div className={styles.pointItem}>
              <span>Consolidated freight & on-site assembly fleet</span>
            </div>
            <div className={styles.pointItem}>
              <span>Full GST Input Tax Credit (ITC) billing</span>
            </div>
            <div className={styles.pointItem}>
              <span>Assigned enterprise key account specialist</span>
            </div>
          </div>

          <div className={styles.b2bStatGrid}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>500+</span>
              <span className={styles.statDesc}>Commercial Projects Furnished</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>Up to 35%</span>
              <span className={styles.statDesc}>Tiered Volume Savings</span>
            </div>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>Request Commercial Trade Quote</h2>
          <p>
            Tell us about your organization and project scope. We route all trade requests for same-day specialist review.
          </p>
          <BulkEnquiryForm />
        </div>
      </section>
    </main>
  );
}

