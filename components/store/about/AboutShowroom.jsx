import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured } from '@/lib/site-config';
import styles from './AboutSections.module.css';

export default function AboutShowroom({ config = siteConfig } = {}) {
  const showroom = config.showroom;

  if (!isConfigured(showroom.addressLine1)) {
    return null;
  }

  const fullAddress = [showroom.addressLine1, showroom.city, showroom.state, showroom.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <section className={`section ${styles.showroomSection}`}>
      <div className="container">
        <div className={styles.showroomCard}>
          <div className={styles.showroomInfo}>
            <span className="kicker">Experience In Person</span>
            <h3>Visit the Riddhy Showroom.</h3>
            <p>
              Touch fabrics, test seat depths, examine solid wood joinery, and see appliance finishes in natural light. Our showroom hosts dedicated design advisors.
            </p>

            <div className={styles.showroomActions}>
              <Link href="/consultation?mode=showroom" className={styles.showroomBtn}>
                Book a showroom visit <Icon name="arrow" size={15} />
              </Link>
              {isConfigured(showroom.mapUrl) && (
                <a
                  href={showroom.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsLink}
                >
                  <Icon name="mapPin" size={16} /> Get directions
                </a>
              )}
            </div>
          </div>

          <div className={styles.showroomHoursBlock}>
            <div>
              <b>Address</b>
              <span>{fullAddress}</span>
            </div>
            {isConfigured(showroom.hours) && (
              <div>
                <b>Opening Hours</b>
                <span>{showroom.hours}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
