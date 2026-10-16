import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Clear Delivery',
    desc: 'Advance scheduling with direct vehicle tracking and verified arrival windows.'
  },
  {
    num: '02',
    title: 'Expert Installation',
    desc: 'Trained technicians unpack, level, assemble, test, and remove packaging safely.'
  },
  {
    num: '03',
    title: 'Legible Warranty',
    desc: 'Clear coverage terms without fine-print confusion. Track your coverage in your account.'
  },
  {
    num: '04',
    title: 'Dedicated Aftercare',
    desc: 'Real support from human advisors who know your order history and room plan.'
  }
];

export default function AboutCareTimeline() {
  return (
    <section className={`section ${styles.careSection}`}>
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="kicker">The Riddhy Journey</span>
          <h2>Care that stays with you.</h2>
        </div>

        <div className={styles.careTimelineGrid}>
          {STEPS.map((step) => (
            <div key={step.num} className={styles.careStep}>
              <div className={styles.careMarker}>
                {step.num === '04' ? <Icon name="check" size={18} /> : step.num}
              </div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
