'use client';

import { useDispatch } from 'react-redux';
import { setOffersModal } from '@/store/uiSlice';
import Countdown from '@/components/ui/Countdown';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './CampaignSection.module.css';
const defaultEndAt = '2026-11-30T18:29:59+05:30';

export default function CampaignSection({ campaign }) {
  const dispatch = useDispatch();

  const title = campaign?.title || 'Golden Hour';
  const subtitle = campaign?.subtitle || campaign?.description || 'Warm textures, considered proportions and the quiet pleasure of a home that works beautifully.';
  const kicker = campaign?.badge || 'Seasonal deal · fixed end date';
  const endsAt = campaign?.endsAt ? new Date(campaign.endsAt).toISOString() : defaultEndAt;

  return (
    <section className={styles.campaign}>
      <div className={styles.dust} aria-hidden="true" />
      <div className={styles.content}>
        <span className="kicker">
          {kicker}
        </span>
        <h2>
          {title.includes(' ') ? (
            <>
              {title.split(' ')[0]}<br />
              <em>{title.split(' ').slice(1).join(' ')}.</em>
            </>
          ) : (
            title
          )}
        </h2>
        <p>
          {subtitle}
        </p>
        <div className={styles.timerLabel}>
          {campaign?.title || 'The Golden Hour deal'} ends <strong>{new Date(endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        </div>
        <Countdown endsAt={endsAt} />
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
        <b>{title.toUpperCase()}</b>
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
