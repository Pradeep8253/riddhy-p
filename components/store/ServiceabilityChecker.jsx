'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './ServiceabilityChecker.module.css';

export default function ServiceabilityChecker() {
  const [pin, setPin] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  const check = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setState({
        status: 'error',
        message: 'Enter a valid 6-digit pincode.'
      });
      return;
    }
    setState({
      status: 'loading',
      message: 'Checking delivery options…'
    });
    try {
      const response = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin })
      });
      const json = await response.json();
      setState({
        status: json.success ? 'success' : 'error',
        message: json.success ? json.data.message : (json.error?.message || 'Could not check this pincode.')
      });
    } catch {
      setState({
        status: 'error',
        message: 'Please try again in a moment.'
      });
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Icon name="pin" size={22} />
      </div>
      <div className={styles.copy}>
        <h3>
          Is your pin code in our service area?
        </h3>
        <p>
          Check delivery and installation availability before choosing.
        </p>
        <form onSubmit={check}>
          <label className="sr-only" htmlFor="service-pin">
            Six-digit pincode
          </label>
          <input
            id="service-pin"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit pincode"
          />
          <button type="submit" disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Checking' : 'Check'}
          </button>
        </form>
        {state.message && (
          <div className={`${styles.result} ${styles[state.status]}`} role="status">
            {state.status === 'success' && <Icon name="check" size={15} />} {state.message}
          </div>
        )}
      </div>
      <span className={styles.deco} aria-hidden="true">
        DELHI · NCR · MORE
      </span>
    </div>
  );
}
