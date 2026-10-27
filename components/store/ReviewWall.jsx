import Image from 'next/image';
import styles from './ReviewWall.module.css';

const reviewImages = [
  '/images/review-living.webp',
  '/images/review-bedroom.webp',
  '/images/review-dining.webp',
  '/images/review-delivery.webp'
];

const cards = [
  ['Living spaces', 'Real homes', 'Customer spaces styled with RF Riddhy sofas, accent lighting and thoughtful details.'],
  ['Bedrooms', 'Quiet retreats', 'Solid wood beds and balanced bedside tables, assembled and styled in Indian homes.'],
  ['Dining', 'Gather here', 'Considered dining sets built for everyday family meals and festive celebrations.'],
  ['Delivery & Care', 'Service', 'White-glove placement, careful unboxing and complete debris removal.']
];

export default function ReviewWall() {
  return (
    <div className={styles.wall}>
      {cards.map(([title, tagline, copy], index) => (
        <article key={title} className={`${styles.card} ${index % 2 === 1 ? styles.offset : ''}`}>
          <div className={styles.photo}>
            <Image
              src={reviewImages[index]}
              alt={`${tagline} customer space`}
              fill
              sizes="(max-width:700px) 80vw, 25vw"
              unoptimized
            />
          </div>
          <div className={styles.body}>
            <span>{tagline}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
