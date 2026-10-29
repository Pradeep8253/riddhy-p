'use client';

import Image from 'next/image';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './OffersClient.module.css';

import { useState, useEffect } from 'react';

const fallbackOffers = [
  {
    title: 'Diwali Dhamaka Offer',
    text: 'Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech in Prayagraj.',
    image: '/images/festivals/diwali-dhamaka-banner.webp',
    ends: 'Festive Season',
    href: '/offers'
  },
  {
    title: 'Our Packages & Home Suites',
    text: 'All 5 complete home setup packages from ₹49,999 to ₹89,999 with bed, sofa, smart TV, fridge, cooler & washing machine.',
    image: '/images/packages/package-premium-marriage.webp',
    ends: 'Showroom Special',
    href: '/packages'
  },
  {
    title: 'Smart Kitchen & Care Suite',
    text: 'Convertible inverter refrigerators, AI steam washers & convection microwave suites with extended warranty.',
    image: '/images/appliances/appliance-suite-hero.webp',
    ends: 'Appliance Carnival',
    href: '/appliances'
  }
];

export default function OffersClient() {
  const [offersList, setOffersList] = useState(fallbackOffers);

  useEffect(() => {
    fetch('/api/banners?zone=all')
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : (json?.data || []);
        if (list.length > 0) {
          setOffersList(
            list.map((b) => ({
              title: b.title || b.name,
              text: b.subtitle || b.description,
              image: b.desktopImage || '/images/diwali-dhamaka-banner.jpg',
              ends: b.endsAt
                ? `Ends ${new Date(b.endsAt).toLocaleDateString('en-IN')}`
                : b.campaignTag || 'Active Festival Promotion',
              href: b.href || '/offers'
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <span className="kicker">
            Offers, with the details up front
          </span>
          <h1>
            Good moments.<br /><em>Clear terms.</em>
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
            {offersList.map((offer, idx) => (
              <article className={styles.card} key={offer.title + idx}>
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

