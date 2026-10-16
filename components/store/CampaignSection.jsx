'use client';

import Link from 'next/link';
import Countdown from '@/components/ui/Countdown';
import Button from '@/components/ui/Button';
import styles from './CampaignSection.module.css';
const endAt='2026-11-30T18:29:59+05:30';
export default function CampaignSection(){return <section className={styles.campaign}><div className={styles.dust} aria-hidden="true"/><div className={styles.content}><span className="kicker">Seasonal edit · fixed end date</span><h2>Golden<br/><em>Hour.</em></h2><p>Warm textures, considered proportions and the quiet pleasure of a home that works beautifully.</p><div className={styles.timerLabel}>The Golden Hour edit ends <strong>30 November 2026</strong></div><Countdown endsAt={endAt}/><Button href="/offers" variant="gold" size="lg">Explore the edit <span aria-hidden="true">↗</span></Button></div><div className={styles.emblem} aria-hidden="true"><span>RF</span><i/><b>GOLDEN HOUR</b></div><Link href="/offers" className={styles.corner}>FURNITURE · APPLIANCES · A HOME IN BALANCE</Link></section>}
