'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { CONSULTATION_FAQS } from '@/lib/consultation-faq-data';
import styles from './ConsultationFaq.module.css';

export default function ConsultationFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className={styles.faqList}>
      {CONSULTATION_FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        const question = item.q;
        const answer = item.a;

        return (
          <div key={item.q} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button
              type="button"
              className={styles.question}
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
            >
              <span>{question}</span>
              <Icon name="chevron" size={18} className={styles.icon} />
            </button>
            {isOpen && (
              <div className={styles.answer} role="region">
                <p>{answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
