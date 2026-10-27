'use client';

import Icon from '@/components/ui/Icon';
import styles from '../AdminSettings.module.css';

export default function StickySaveBar({ isDirty, isSaving, onSave, onReset }) {
  if (!isDirty && !isSaving) return null;

  return (
    <div className={styles.stickySaveBar} role="region" aria-label="Unsaved changes bar">
      <div className={styles.stickyBarInfo}>
        <span className={styles.pulsingDot} />
        <div>
          <b>You have unsaved modifications</b>
          <p>Don't forget to save your changes to publish them across store channels.</p>
        </div>
      </div>
      <div className={styles.stickyBarActions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onReset}
          disabled={isSaving}
          style={{ background: '#22382c', color: '#d3e2d5', borderColor: '#355342' }}
        >
          Discard Changes
        </button>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={styles.spinner} />
              <span>Saving…</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} />
              <span>Save & Publish</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
