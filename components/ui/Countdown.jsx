'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ endsAt, compact = false }) {
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    const target = new Date(endsAt).getTime();
    const calculate = () => Math.max(0, target - Date.now());
    setRemaining(calculate());
    const timer = window.setInterval(() => {
      setRemaining(calculate());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (!mounted) {
    return (
      <span
        className={compact ? 'countdown-compact' : 'countdown'}
        aria-hidden="true"
        suppressHydrationWarning
      >
        <b suppressHydrationWarning>
          00<i>d</i>
        </b>
        <b suppressHydrationWarning>
          00<i>h</i>
        </b>
        <b suppressHydrationWarning>
          00<i>m</i>
        </b>
        {!compact && (
          <b suppressHydrationWarning>
            00<i>s</i>
          </b>
        )}
      </span>
    );
  }

  if (remaining <= 0) {
    return <span className="countdown-ended">Campaign ended</span>;
  }

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span
      className={compact ? 'countdown-compact' : 'countdown'}
      aria-label={`${days} days ${hours} hours remaining`}
    >
      <b>
        {String(days).padStart(2, '0')}
        <i>d</i>
      </b>
      <b>
        {String(hours).padStart(2, '0')}
        <i>h</i>
      </b>
      <b>
        {String(minutes).padStart(2, '0')}
        <i>m</i>
      </b>
      {!compact && (
        <b>
          {String(seconds).padStart(2, '0')}
          <i>s</i>
        </b>
      )}
    </span>
  );
}
