import { siteConfig } from '@/lib/site-config';
import styles from './AboutSections.module.css';

export default function AboutPartners({ config = siteConfig } = {}) {
  const brands = config.story.partnerBrands;

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className={styles.partnersSection}>
      <div className="container">
        <span className="kicker">Authorized Brands & Partners</span>
        <div className={styles.partnersGrid}>
          {brands.map((brand) => (
            <span key={brand} className={styles.partnerBadge}>
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
