'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IMG } from '@/lib/images';
import Button from '@/components/ui/Button';
import Countdown from '@/components/ui/Countdown';
import Icon from '@/components/ui/Icon';
import styles from './HomeHero.module.css';

const endAt='2026-11-30T18:29:59+05:30';
export default function HomeHero(){
  return <section className={`${styles.hero} cinematic-hero`} aria-labelledby="hero-title">
    <div className={styles.poster}><Image src={IMG.hero.desktop} alt={IMG.hero.alt} fill priority sizes="100vw" placeholder="blur" blurDataURL={IMG.blurDataURL} unoptimized className={styles.desktopImage}/><Image src={IMG.hero.mobile} alt="" fill sizes="100vw" placeholder="blur" blurDataURL={IMG.blurDataURL} unoptimized className={styles.mobileImage}/></div>
    <div className={styles.overlay}/><div className={styles.orbit} aria-hidden="true"><span>RF</span></div>
    <div className={`container ${styles.content}`}>
      <div className={styles.copy}>
        <div className={styles.campaign}><span className={styles.liveDot}/><span>THE GOLDEN HOUR EDIT</span><b>ENDS IN</b><Countdown endsAt={endAt} compact/></div>
        <span className="kicker">Living spaces · thoughtfully curated</span>
        <h1 id="hero-title">Furnish your<br/><em>story.</em></h1>
        <p>Furniture with a sense of home. Appliances chosen for the everyday things that matter.</p>
        <div className={styles.ctas}><Button href="/furniture" size="lg">Shop furniture <Icon name="arrow" size={17}/></Button><Button href="/appliances" variant="outline" size="lg">Shop appliances</Button></div>
        <div className={styles.proof}><span><Icon name="check" size={15}/> Clear warranty terms</span><span><Icon name="truck" size={17}/> Delivery, made considered</span></div>
      </div>
      <div className={styles.sideNote}><span>01 / 02</span><i/><span>FURNITURE + APPLIANCES</span></div>
    </div>
    <div className={styles.bottom}><span>Curated for real homes</span><span>Scroll to explore <b>↓</b></span></div>
    <Link className={styles.mobileJump} href="/appliances" aria-label="Explore home appliances">Power your home <Icon name="arrow" size={16}/></Link>
  </section>;
}
