import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

const BELIEFS = [
  {
    num: '01',
    icon: 'home',
    title: 'Room-first thinking',
    desc: 'Furniture is more than a product catalog entry. It defines how a room moves, how light settles across a space, and how people gather and rest.'
  },
  {
    num: '02',
    icon: 'sparkles',
    title: 'Clear appliance choices',
    desc: 'Capacity, dimensions, energy efficiency, and doorway clearances deserve a calm, precise explanation—not spec-sheet confusion.'
  },
  {
    num: '03',
    icon: 'shield',
    title: 'Care that continues',
    desc: 'Warranty terms, delivery timelines, installation windows, and genuine aftercare must be easy to find before and long after an order.'
  }
];

export default function AboutBeliefs() {
  return (
    <section className={`section ${styles.beliefsSection}`}>
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="kicker">Warm. Prosperous. Trustworthy.</span>
          <h2>A home should feel considered, not complicated.</h2>
        </div>

        <div className={styles.beliefsGrid}>
          {BELIEFS.map((belief) => (
            <article key={belief.num} className={styles.beliefCard}>
              <div className={styles.beliefCardHead}>
                <div className={styles.beliefIcon}>
                  <Icon name={belief.icon} size={20} />
                </div>
                <span className={styles.beliefNum}>{belief.num}</span>
              </div>
              <div className={styles.beliefCardBody}>
                <h3 className={styles.beliefTitle}>{belief.title}</h3>
                <p className={styles.beliefDesc}>{belief.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
