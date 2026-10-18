'use client';

import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger' // danger, primary
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`${styles.confirmBtn} ${tone === 'danger' ? styles.dangerBtn : styles.primaryBtn}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
