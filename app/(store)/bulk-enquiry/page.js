import BulkEnquiryForm from '@/components/commerce/BulkEnquiryForm';
import { getCanonicalUrl, getBreadcrumbSchema } from '@/lib/seo';
import styles from './bulk.module.css';

export const metadata = {
  title: 'Bulk Furniture & Appliance Orders in Prayagraj | RF Riddhy Commercial Desk',
  description:
    'Furnishing hotels, offices, hostesses or wedding events in Prayagraj? Request bulk quotes with volume discounts, GST tax credit and white-glove delivery from Riddhy Furnitures.',
  alternates: {
    canonical: getCanonicalUrl('/bulk-enquiry'),
  },
  openGraph: {
    title: 'Bulk Furniture & Appliance Orders in Prayagraj | RF Riddhy',
    description:
      'Commercial bulk quotes, institutional supply, and hotel/hostel furnishing in Prayagraj.',
    url: getCanonicalUrl('/bulk-enquiry'),
  },
};

export default function BulkEnquiryPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Bulk Enquiry', url: '/bulk-enquiry' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c'),
        }}
      />
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
    </>
  );
}

