import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

const pillars = [
  {
    icon: 'shield',
    title: 'Uncompromised Quality',
    desc: 'Kiln-dried pure Sheesham, Grade-A CP Teak, and appliances tested for Indian voltage conditions. No low-density particle boards.'
  },
  {
    icon: 'check',
    title: 'Honest, Competitive Pricing',
    desc: 'Direct-to-home pricing. No inflated dealer commissions, artificial markups, or hidden delivery surprises.'
  },
  {
    icon: 'phone',
    title: 'Personalized Support',
    desc: 'A real team member in Delhi NCR answers your call. From size recommendations to installation tracking, you talk to people, not bots.'
  },
  {
    icon: 'check',
    title: 'Guaranteed Warranty Assistance',
    desc: 'Comprehensive multi-year structural coverage for furniture and official brand warranties with full on-site service support.'
  },
  {
    icon: 'truck',
    title: 'White-Glove Delivery & Setup',
    desc: 'Careful room-of-choice placement, unboxing, assembly, and packaging removal handled by experienced technicians.'
  }
];

export default function AboutWhyChooseUs() {
  return (
    <section className={`section ${styles.whySection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="kicker">Why Choose RF Riddhy</span>
          <h2>Furniture with soul. Appliances chosen for real life.</h2>
          <p>
            We set out to eliminate the guesswork of buying for your home — bringing quality materials,
            fair prices, and human aftercare into one dependable destination.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {pillars.map((item, index) => (
            <div key={item.title} className={styles.pillarCard}>
              <div className={styles.pillarIcon}>
                <Icon name={item.icon} size={22} />
              </div>
              <span className={styles.pillarNumber}>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
