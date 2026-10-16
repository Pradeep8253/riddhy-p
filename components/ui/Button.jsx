import Link from 'next/link';
import styles from './Button.module.css';

export default function Button({ href, children, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, onClick, ...props }) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
  if (href) return <Link href={href} className={classes} {...props}>{children}</Link>;
  return <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>{children}</button>;
}
