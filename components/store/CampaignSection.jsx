'use client';

import { useDispatch } from 'react-redux';
import { setOffersModal } from '@/store/uiSlice';
import Countdown from '@/components/ui/Countdown';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './CampaignSection.module.css';
const endAt = '2026-11-30T18:29:59+05:30';

export default function CampaignSection() {
  const dispatch = useDispatch();

  return (
    <section className={styles.campaign}>
      <div className={styles.dust} aria-hidden="true" />
      <div className={styles.content}>
        <span className="kicker">
          Seasonal deal · fixed end date
        </span>
        <h2>
          Golden<br />
          <em>Hour.</em>
        </h2>
        <p>
          Warm textures, considered proportions and the quiet pleasure of a home that works beautifully.
        </p>
        <div className={styles.timerLabel}>
          The Golden Hour deal ends <strong>30 November 2026</strong>
        </div>
        <Countdown endsAt={endAt} />
        <Button
          onClick={() => dispatch(setOffersModal(true))}
          variant="gold"
          size="lg"
        >
          Explore the deal <Icon name="arrowUpRight" size={16} />
        </Button>
      </div>
      <div className={styles.emblem} aria-hidden="true">
        <span>RF</span>
        <i />
        <b>GOLDEN HOUR</b>
      </div>
      <button
        type="button"
        onClick={() => dispatch(setOffersModal(true))}
        className={styles.corner}
        style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
      >
        FURNITURE · APPLIANCES · A HOME IN BALANCE
      </button>
    </section>
  );
}
