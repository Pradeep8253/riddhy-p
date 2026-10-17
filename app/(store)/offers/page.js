import Link from 'next/link';
import Image from 'next/image';
import { IMG } from '@/lib/images';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './offers.module.css';
export const metadata = {
  title: 'Offers & seasonal deals',
  description: 'Browse scheduled campaigns and currently available offers at RF Riddhy. Terms and end dates are shown clearly.'
};

const offers = [
  {
    title: 'Golden Hour deal',
    text: 'A warm seasonal deal across furniture and home appliances. Check item pages for eligible prices and terms.',
    image: IMG.banners.festive,
    ends: '30 November 2026',
    href: '/furniture'
  },
  {
    title: 'Appliance studio',
    text: 'Explore a considered range. Current product prices and any eligible promotion appear on each product page.',
    image: IMG.banners.appliances,
    ends: 'Scheduled campaign',
    href: '/appliances'
  },
  {
    title: 'Delivery & installation',
    text: 'See delivery and installation eligibility before paying. Available service depends on product and pincode.',
    image: IMG.banners.installation,
    ends: 'Service information',
    href: '/policies/shipping'
  }
];

export default function OffersPage() {
  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <span className="kicker">Offers, with the details up front</span>
          <h1>
            Good moments.<br />
            <em>Clear terms.</em>
          </h1>
          <p>
            Campaigns have real schedules. No rolling countdowns, no invented stock alerts—just the deals, the dates and the conditions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Current and upcoming"
            title="Explore the deals."
            description="Campaign cards show our seasonal promotions and package schedules with clear terms."
          />
          <div className={styles.grid}>
            {offers.map((offer) => (
              <article className={styles.card} key={offer.title}>
                <div className={styles.image}>
                  <Image
                    src={offer.image}
                    alt={`${offer.title} campaign illustration`}
                    fill
                    sizes="(max-width:700px) 88vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className={styles.cardBody}>
                  <span>{offer.ends}</span>
                  <h2>{offer.title}</h2>
                  <p>{offer.text}</p>
                  <Button href={offer.href} variant="outline" size="sm">
                    Explore <Icon name="arrowUpRight" size={15} />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
