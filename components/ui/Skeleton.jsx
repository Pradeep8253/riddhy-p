import styles from './Skeleton.module.css';
export function ProductSkeleton({ count = 4 }) { return <div className={styles.grid} aria-label="Loading products">{Array.from({length:count},(_,i)=><div key={i} className={styles.card}><div className={styles.image}/><div className={styles.line}/><div className={styles.short}/><div className={styles.line}/></div>)}</div>; }
export default function Skeleton({ height = 20, width = '100%', radius = 8 }) { return <span className={styles.skeleton} style={{ height, width, borderRadius: radius }} aria-hidden="true"/>; }
