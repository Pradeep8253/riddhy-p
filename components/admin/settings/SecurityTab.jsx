'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import styles from '../AdminSettings.module.css';

export default function SecurityTab() {
  const [totpEnforced, setTotpEnforced] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('7');
  const [minPasswordLength, setMinPasswordLength] = useState('10');
  const [lockoutThreshold, setLockoutThreshold] = useState('5');
  const [saved, setSaved] = useState(false);

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Admin Authentication & Security Policies</h2>
        <p>
          Configure brute-force protection, account lockout thresholds, password complexity rules,
          and optional Two-Factor Authentication (TOTP).
        </p>
      </div>

      <form onSubmit={handleSaveSecurity}>
        <div className={styles.sectionDivider}>
          <h4>1. Brute-Force & Lockout Thresholds</h4>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="sec-lockout">Consecutive Failed Attempts Before Lockout</label>
            <select
              id="sec-lockout"
              className={styles.select}
              value={lockoutThreshold}
              onChange={(e) => setLockoutThreshold(e.target.value)}
            >
              <option value="3">3 Attempts (Strict)</option>
              <option value="5">5 Attempts (Standard Recommended)</option>
              <option value="10">10 Attempts (Relaxed)</option>
            </select>
            <small className={styles.helpText}>Locks user account for 15 minutes upon exceeding threshold.</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="sec-session">Session Expiration Duration (Days)</label>
            <select
              id="sec-session"
              className={styles.select}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
            >
              <option value="1">1 Day (High Security)</option>
              <option value="7">7 Days (Standard)</option>
              <option value="30">30 Days (Extended)</option>
            </select>
            <small className={styles.helpText}>HTTP-only secure JWT session lifetime.</small>
          </div>
        </div>

        <div className={styles.sectionDivider} style={{ marginTop: 24 }}>
          <h4>2. Password Complexity Rules</h4>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="sec-minPass">Minimum Password Length</label>
            <input
              id="sec-minPass"
              type="number"
              min={8}
              max={32}
              className={styles.input}
              value={minPasswordLength}
              onChange={(e) => setMinPasswordLength(e.target.value)}
            />
            <small className={styles.helpText}>Requires at least one uppercase, lowercase, and numeric digit.</small>
          </div>

          <div className={styles.field}>
            <label>Two-Factor Authentication (TOTP 2FA)</label>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={totpEnforced}
                  onChange={(e) => setTotpEnforced(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--rf-green-800)' }}
                />
                Require Authenticator App (Google Authenticator, Authy) for Super Admins
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button type="submit" className={styles.saveBtn}>
            Update Security Policies
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: '#1b5e20', fontWeight: 600 }}>
              Security policies updated.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
