import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './AboutSections.module.css';

export default function AboutHero({ config }) {
  const brandName = config?.brandName || 'RF Riddhy';

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
              {' '}{brandName} brings both worlds together—thoughtfully, practically, and with care.
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
              src="/images/about/about-hero-lifestyle.webp"
              alt="RF Riddhy modern living showroom combining elegant furniture with integrated home appliances"
              width={1376}
              height={768}
              priority
              sizes="(max-width: 700px) 90vw, 45vw"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
