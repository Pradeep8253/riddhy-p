import Icon from '@/components/ui/Icon';
import styles from './StatCard.module.css';

export default function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  tone = 'neutral', // green, gold, red, blue, neutral
  hint,
  className = ''
}) {
  const isPositive = typeof delta === 'number' && delta > 0;
  const isNegative = typeof delta === 'number' && delta < 0;

  return (
    <div className={`${styles.statCard} ${styles[tone] || ''} ${className}`}>
      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        {icon && (
          <div className={styles.iconCircle}>
            <Icon name={icon} size={16} />
          </div>
        )}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
      </div>

      {(delta !== undefined || hint) && (
        <div className={styles.footerRow}>
          {delta !== undefined && (
            <span
              className={`${styles.deltaBadge} ${
                isPositive ? styles.deltaUp : isNegative ? styles.deltaDown : styles.deltaNeutral
              }`}
            >
              {isPositive ? '↑ +' : isNegative ? '↓ ' : ''}
              {delta}%
            </span>
          )}
          <span className={styles.deltaLabel}>{deltaLabel || hint}</span>
        </div>
      )}
    </div>
  );
}
