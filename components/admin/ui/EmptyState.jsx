import Icon from '@/components/ui/Icon';
import styles from './EmptyState.module.css';

export default function EmptyState({
  icon = 'database',
  title = 'No records found',
  description = 'There are no items matching this criteria right now.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.iconCircle}>
        <Icon name={icon} size={28} />
      </div>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
