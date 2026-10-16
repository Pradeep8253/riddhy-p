import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

export default function AboutDuo() {
  return (
    <section className={`section ${styles.duoSection}`}>
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="kicker">Unified Living</span>
          <h2>Furniture and appliances under one roof.</h2>
          <p className="muted">
            Most stores treat furniture and home appliances as two separate worlds. We bring them together so your living room and kitchen feel in harmony.
          </p>
        </div>

        <div className={styles.duoGrid}>
          <div className={styles.duoCard}>
            <div>
              <span className="kicker">Comfort & Form</span>
              <h3>Thoughtful Furniture</h3>
              <p>
                From durable solid wood dining tables to multi-density foam modular sofas and space-saving wardrobes. Hand-finished details made for Indian daily life.
              </p>
            </div>
            <Link href="/furniture" className={styles.duoLink}>
              Browse furniture collection <Icon name="arrow" size={16} />
            </Link>
          </div>

          <div className={styles.duoCard}>
            <div>
              <span className="kicker">Flow & Utility</span>
              <h3>Dependable Appliances</h3>
              <p>
                Energy-efficient inverter refrigerators, smart front-load washers, silent kitchen chimneys, and calibrated air conditioners. Checked for dimensions and electrical fit.
              </p>
            </div>
            <Link href="/appliances" className={styles.duoLink}>
              Browse home appliances <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
