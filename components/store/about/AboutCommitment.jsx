import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import styles from './AboutSections.module.css';

export default function AboutCommitment() {
  return (
    <section className={`section ${styles.commitmentSection}`}>
      <div className="container">
        <div className={styles.commitmentGrid}>
          <div className={styles.commitmentCopy}>
            <span className="kicker">Our Daily Commitment</span>
            <h2>We don’t just furnish spaces. We stand by them.</h2>
            <p>
              Furnishing a new home or upgrading everyday appliances is an emotional and financial milestone.
              That is why our relationship with our customers does not end at the checkout.
            </p>
            <p>
              Whether it is coordinating a seamless weekend delivery window, walking through custom fabric
              options over video call, or dispatching an authorized technician for warranty inspection, our
              promise is simple: <strong>reliable service, personalized guidance, and zero frustration.</strong>
            </p>

            <div className={styles.commitmentBadges}>
              <div className={styles.badgeItem}>
                <Icon name="check" size={18} />
                <span>Dedicated Advisor for Every Order</span>
              </div>
              <div className={styles.badgeItem}>
                <Icon name="check" size={18} />
                <span>100% Genuine Brand Warranties</span>
              </div>
              <div className={styles.badgeItem}>
                <Icon name="check" size={18} />
                <span>Pre-Delivery Quality Inspection</span>
              </div>
            </div>
          </div>

          <div className={styles.commitmentQuoteCard}>
            <div className={styles.quoteMark}>“</div>
            <blockquote>
              A home should feel settled, comfortable, and made to last. Our work is to help you build that
              feeling with furniture you love touching and appliances you never have to worry about.
            </blockquote>
            <div className={styles.quoteAuthor}>
              <b>The RF Riddhy Team</b>
              <span>Delhi NCR · Craft & Care Desk</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
