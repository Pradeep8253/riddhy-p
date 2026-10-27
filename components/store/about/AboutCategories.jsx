import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

const defaultCategories = [
  {
    title: 'Living Room Furniture',
    description: 'Chesterfields, fabric sectional sofas, solid Sheesham coffee tables, and fluted TV units.',
    href: '/furniture/living',
    image: '/images/room-living.webp',
    tag: 'Handcrafted Furniture'
  },
  {
    title: 'Master & Guest Bedrooms',
    description: 'Hydraulic storage beds, orthopedic pocket-spring mattresses, and modular wardrobes.',
    href: '/furniture/bedroom',
    image: '/images/room-bedroom.webp',
    tag: 'Solid Wood & Storage'
  },
  {
    title: 'Dining & Entertaining',
    description: 'Italian marble top dining tables, solid teak 6-seater sets, and display buffets.',
    href: '/furniture/dining',
    image: '/images/room-dining.webp',
    tag: 'Center of the Home'
  },
  {
    title: 'Refrigeration & Cooling',
    description: 'Frost-free convertible double-door & side-by-side smart inverter refrigerators.',
    href: '/appliances/refrigerators',
    image: '/images/category-refrigerators.webp',
    tag: '5-Star Energy Saver'
  },
  {
    title: 'Fabric & Laundry Care',
    description: 'AI inverter front-load washers and washer-dryer combos with hygiene steam care.',
    href: '/appliances/washing-machines',
    image: '/images/category-washers.webp',
    tag: 'Allergen Steam Wash'
  },
  {
    title: 'Smart Kitchen Tech',
    description: 'Convection microwave ovens, touch induction hobs, and motion-sensing auto-clean chimneys.',
    href: '/appliances',
    image: '/images/category-microwave.webp',
    tag: 'Effortless Cooking'
  }
];

export default function AboutCategories({ categories: propCategories = [] }) {
  const displayCategories =
    Array.isArray(propCategories) && propCategories.length >= 4
      ? propCategories.slice(0, 6).map((c) => ({
          title: c.name,
          description:
            c.description ||
            (c.type === 'furniture'
              ? 'Thoughtfully handcrafted solid wood & tailored upholstery.'
              : 'Energy-efficient dependable technology for Indian homes.'),
          href: c.type === 'furniture' ? `/furniture/${c.slug}` : `/appliances/${c.slug}`,
          image: c.image || '/images/room-living.webp',
          tag: c.type === 'furniture' ? 'Handcrafted Furniture' : 'Energy-Smart Appliances'
        }))
      : defaultCategories;
  return (
    <section className={`section ${styles.categoriesSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="kicker">Curated Collections</span>
          <h2>Everything your home needs, under one roof.</h2>
          <p>
            From heirloom solid wood furniture that anchors your living room to energy-smart appliances
            engineered for daily peace of mind.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {displayCategories.map((cat) => (
            <Link key={cat.title} href={cat.href} className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.categoryImg}
                    unoptimized
                  />
                ) : null}
                <span className={styles.categoryTag}>{cat.tag}</span>
              </div>
              <div className={styles.categoryContent}>
                <h3>{cat.title}</h3>
                <p>{cat.description}</p>
                <span className={styles.categoryLink}>
                  Explore category <Icon name="arrow" size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
