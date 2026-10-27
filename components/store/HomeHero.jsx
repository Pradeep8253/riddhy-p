'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import Countdown from '@/components/ui/Countdown';
import Icon from '@/components/ui/Icon';
import { tr } from '@/lib/i18n';
import styles from './HomeHero.module.css';

const endAt = '2026-11-30T18:29:59+05:30';

export default function HomeHero() {
  const locale = useSelector((state) => state.ui?.locale || 'en');

  return (
    <section className={`${styles.hero} cinematic-hero`} aria-labelledby="hero-title">
      <div className={styles.poster}>
        <Image
          src="/images/hero-desktop.webp"
          alt="Warm modern living room beside a compact appliance display"
          fill
          priority
          sizes="100vw"
          unoptimized
          className={styles.desktopImage}
        />
        <Image
          src="/images/hero-mobile.webp"
          alt=""
          fill
          sizes="100vw"
          unoptimized
          className={styles.mobileImage}
        />
      </div>
      <div className={styles.overlay} />
      <div className={styles.orbit} aria-hidden="true">
        <span>RF</span>
      </div>
      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <div className={styles.campaign}>
            <span className={styles.liveDot} />
            <span>{tr(locale, 'goldenHourDeal')}</span>
            <b>{tr(locale, 'dealEndsIn')}</b>
            <Countdown endsAt={endAt} compact />
          </div>
          {/* <span className={`kickers kicker-hero ${styles.kickers}`}>{tr(locale, 'curatedLiving')}</span> */}
          <h1 id="hero-title">
            Furnish your<br />
            <em>story.</em>
          </h1>
          <p>{tr(locale, 'heroSubtitle')}</p>
          <div className={styles.ctas}>
            <Button href="/furniture" size="lg">
              {tr(locale, 'shopFurniture')} <Icon name="arrow" size={17} />
            </Button>
            <Button href="/appliances" variant="outline" size="lg">
              {tr(locale, 'shopAppliances')}
            </Button>
          </div>
          <div className={styles.proof}>
            <span>
              <Icon name="check" size={15} /> {tr(locale, 'clearWarrantyTerms')}
            </span>
            <span>
              <Icon name="truck" size={17} /> {tr(locale, 'deliveryMadeConsidered')}
            </span>
          </div>
        </div>
        <div className={styles.sideNote}>
          <span>01 / 02</span>
          <i />
          <span>FURNITURE + APPLIANCES</span>
        </div>
      </div>
      {/* <div className={styles.bottom}>
        <span>{tr(locale, 'curatedForRealHomes')}</span>
        <span>
          {tr(locale, 'scrollToExplore')}{' '}
          <Icon
            name="arrowDown"
            size={13}
            style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}
          />
        </span>
      </div> */}
      <Link className={styles.mobileJump} href="/appliances" aria-label="Explore home appliances">
        {tr(locale, 'powerYourHome')} <Icon name="arrow" size={16} />
      </Link>
    </section>
  );
}
