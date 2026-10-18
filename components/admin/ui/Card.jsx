import styles from './Card.module.css';

export default function Card({
  title,
  subtitle,
  actions,
  children,
  footer,
  className = '',
  glass = false,
  ...props
}) {
  return (
    <div className={`${styles.card} ${glass ? styles.glass : ''} ${className}`} {...props}>
      {(title || subtitle || actions) && (
        <div className={styles.head}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
