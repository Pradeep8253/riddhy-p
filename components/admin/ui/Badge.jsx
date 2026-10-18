import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'neutral', // success, warning, danger, info, gold, neutral
  dot = false,
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) {
  return (
    <span
      className={`${styles.badge} ${styles[variant] || styles.neutral} ${styles[size] || styles.md} ${className}`}
      {...props}
    >
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
