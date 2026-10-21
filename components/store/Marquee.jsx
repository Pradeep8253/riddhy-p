import Icon from '@/components/ui/Icon';
import styles from './Marquee.module.css';

const notes = [
  'Verified warranty details',
  'Delivery scheduling you can see',
  'Installation options before payment',
  'Secure checkout',
  'Clear returns and support',
];

// Duplicate items to ensure wide screens are completely covered
const marqueeItems = [...notes, ...notes];

export default function Marquee() {
  return (
    <div className={styles.strip} aria-label="Store assurances">
      <div className={styles.track}>
        {/* Primary Set */}
        <div className={styles.group}>
          {marqueeItems.map((note, index) => (
            <span key={`group-1-${index}`}>
              <Icon name="check" size={14} />
              {note}
              <i>✦</i>
            </span>
          ))}
        </div>

        {/* Seamless Duplicate Set */}
        <div className={styles.group} aria-hidden="true">
          {marqueeItems.map((note, index) => (
            <span key={`group-2-${index}`}>
              <Icon name="check" size={14} />
              {note}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
