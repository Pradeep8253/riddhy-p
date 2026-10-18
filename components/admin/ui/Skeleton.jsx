import styles from './Skeleton.module.css';

export default function Skeleton({
  variant = 'text', // text, circle, rect, card
  width,
  height,
  className = '',
  count = 1,
  style = {}
}) {
  const elements = Array.from({ length: count });

  return (
    <>
      {elements.map((_, i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${styles[variant] || styles.text} ${className}`}
          style={{
            width: width,
            height: height,
            ...style
          }}
        />
      ))}
    </>
  );
}
