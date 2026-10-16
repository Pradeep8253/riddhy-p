'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './DeliveryTimeline.module.css';

const steps = [
  {
    step: '01',
    title: 'Choose your piece',
    tag: 'Browse & Select',
    body: 'Explore room-ready furniture and appliances. Dimensions, live stock, and assembly requirements are clearly shown upfront.',
    highlight: 'Real-time stock & dimensions'
  },
  {
    step: '02',
    title: 'Pick a convenient slot',
    tag: 'Flexible Schedule',
    body: 'Select delivery windows that suit you. Morning and afternoon slots available with proactive 2-hour call-ahead before arrival.',
    highlight: '2-hour advance call-ahead'
  },
  {
    step: '03',
    title: 'Insured safe transit',
    tag: 'Careful Dispatch',
    body: 'Multi-layer honeycomb padding and dedicated logistics fleet ensure zero transit scuffs or handling damages.',
    highlight: '100% transit insurance included'
  },
  {
    step: '04',
    title: 'White-glove assembly',
    tag: 'Room Ready',
    body: 'In-room placement, expert unboxing, certified assembly by skilled technicians, and complete packaging debris removal.',
    highlight: 'Zero packaging debris left'
  }
];

export default function DeliveryTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  // Live Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pinState, setPinState] = useState({ status: 'idle', message: '' });

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPinState({
        status: 'error',
        message: 'Please enter a valid 6-digit Indian pincode.'
      });
      return;
    }
    setPinState({ status: 'loading', message: 'Checking delivery network…' });
    try {
      const res = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPinState({
          status: 'success',
          message: data.data?.message || 'Standard delivery and free assembly available in your area.'
        });
      } else {
        setPinState({
          status: 'error',
          message: data.error?.message || 'Delivery is being expanded to this pin. Contact dispatch for express schedule.'
        });
      }
    } catch {
      setPinState({
        status: 'error',
        message: 'Network check temporarily unavailable. Please chat with dispatch.'
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* 4-STEP HORIZONTAL PROCESS TRACK */}
      <div className={styles.processTrack}>
        <div className={styles.stepsGrid}>
          {steps.map((item, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={item.title}
                className={`${styles.stepCard} ${isActive ? styles.stepCardActive : ''}`}
                onMouseEnter={() => setActiveStep(index)}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                onFocus={() => setActiveStep(index)}
              >
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>{item.step}</span>
                  <span className={styles.stepTag}>{item.tag}</span>
                </div>
                <h4 className={styles.stepTitle}>{item.title}</h4>
                <p className={styles.stepBody}>{item.body}</p>
                <div className={styles.stepFeature}>
                  <span className={styles.featureDot} />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL-WIDTH INTEGRATED DELIVERY & WHITE-GLOVE HUB */}
      <div className={styles.hubWrapper}>
        {/* Left: Interactive Pincode Checker */}
        <div className={styles.pincodeBox}>
          <div className={styles.pincodeHead}>
            <div className={styles.pincodeIcon}>
              <Icon name="pin" size={20} />
            </div>
            <div>
              <h4>Check Delivery & Installation Speed</h4>
              <p>Instant estimate for transit turnaround and technician visits in your area.</p>
            </div>
          </div>

          <form className={styles.pinForm} onSubmit={handleCheckPincode}>
            <div className={styles.pinInputRow}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit Pincode (e.g. 800001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={styles.pinInput}
                aria-label="Enter 6-digit Pincode"
              />
              <button
                type="submit"
                className={styles.pinBtn}
                disabled={pinState.status === 'loading'}
              >
                {pinState.status === 'loading' ? 'Checking…' : 'Check Pincode'}
              </button>
            </div>
          </form>

          {pinState.message && (
            <div
              className={`${styles.pinAlert} ${
                pinState.status === 'success' ? styles.pinSuccess : styles.pinError
              }`}
              role="status"
            >
              {pinState.status === 'success' ? (
                <Icon name="check" size={15} />
              ) : (
                <Icon name="info" size={15} />
              )}
              <span>{pinState.message}</span>
            </div>
          )}

          <div className={styles.hotlineRow}>
            <div className={styles.hotlineText}>
              <b>Have custom installation or timing requirements?</b>
              <span>Our logistics desk coordinates direct with your building security and schedule.</span>
            </div>
            <a
              href="https://wa.me/919934208035?text=Hello%20RF%20Riddhy%2C%20I%20have%20a%20question%20about%20delivery%20and%20assembly."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <Icon name="whatsapp" size={16} />
              <span>WhatsApp Dispatch</span>
            </a>
          </div>
        </div>

        {/* Right: 4 White-Glove Guarantees */}
        <div className={styles.guaranteesBox}>
          <div className={styles.guaranteesHead}>
            <span className={styles.kicker}>RF Riddhy White-Glove Standard</span>
            <h4>Included With Every Qualifying Delivery</h4>
          </div>

          <div className={styles.guaranteeGrid}>
            <div className={styles.guaranteeCard}>
              <div className={styles.gIcon}>
                <Icon name="home" size={18} />
              </div>
              <div className={styles.gContent}>
                <b>Room-of-Choice Placement</b>
                <p>Heavy furniture is positioned exactly inside your chosen room, not dumped at the door.</p>
              </div>
            </div>

            <div className={styles.guaranteeCard}>
              <div className={styles.gIcon}>
                <Icon name="check" size={18} />
              </div>
              <div className={styles.gContent}>
                <b>Certified Free Assembly</b>
                <p>Experienced carpenters & electricians assemble beds, wardrobes & mount appliances.</p>
              </div>
            </div>

            <div className={styles.guaranteeCard}>
              <div className={styles.gIcon}>
                <Icon name="shield" size={18} />
              </div>
              <div className={styles.gContent}>
                <b>Zero-Risk Transit Insurance</b>
                <p>100% pre-dispatch QC check with immediate on-spot swap if any transit defect occurs.</p>
              </div>
            </div>

            <div className={styles.guaranteeCard}>
              <div className={styles.gIcon}>
                <Icon name="sparkles" size={18} />
              </div>
              <div className={styles.gContent}>
                <b>Packaging & Debris Cleanup</b>
                <p>All packaging cartons, thermocol, and bubble wrap are completely cleared away cleanly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
