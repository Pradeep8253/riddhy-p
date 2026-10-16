import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './AboutSections.module.css';

export default function AboutMetrics({ config = siteConfig } = {}) {
  const { homesFurnished, pincodesServed, satisfactionRate } = config.story.metrics;

  if (!isConfigured(homesFurnished) && !isConfigured(pincodesServed)) {
    return null;
  }

  return (
    <section className={styles.metricsSection}>
      <div className="container">
        <div className={styles.metricsGrid}>
          {isConfigured(homesFurnished) && (
            <div className={styles.metricItem}>
              <b>{homesFurnished}</b>
              <span>Homes Furnished with Care</span>
            </div>
          )}
          {isConfigured(pincodesServed) && (
            <div className={styles.metricItem}>
              <b>{pincodesServed}</b>
              <span>Active Service Pincodes</span>
            </div>
          )}
          {isConfigured(satisfactionRate) && (
            <div className={styles.metricItem}>
              <b>{satisfactionRate}</b>
              <span>Customer Satisfaction Rating</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
