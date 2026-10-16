import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './AboutSections.module.css';

export default function AboutHero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div>
            <span className="kicker">Our Point of View</span>
            <h1 className={styles.heroTitle}>
              For the way<br />
              home <em>feels.</em>
            </h1>
            <p className={styles.heroSubtitle}>
              Furniture gives a room its character. Appliances make daily life flow.
              RF Riddhy brings both worlds together—thoughtfully, practically, and with care.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Button href="/furniture" variant="gold">
                Explore the collection
              </Button>
              <Button href="/consultation" variant="outline">
                Book a consultation
              </Button>
            </div>
          </div>

          <div className={styles.heroLogoWrap}>
            <Image
              src="/riddhy-logo.jpeg"
              alt="RF Riddhy furniture and home appliances logo, including the tree of life heritage emblem"
              width={640}
              height={640}
              priority
              sizes="(max-width:700px) 90vw, 38vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
