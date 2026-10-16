import styles from './SectionHeading.module.css';
export default function SectionHeading({ eyebrow, title, description, action, align = 'left', tone = 'default' }) {
  return <div className={`${styles.heading} ${styles[align]} ${styles[tone]}`}><div><span className="kicker">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div className={styles.action}>{action}</div>}</div>;
}
