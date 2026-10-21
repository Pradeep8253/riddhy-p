'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setOffersModal, showToast } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import Countdown from '@/components/ui/Countdown';
import styles from './OffersModal.module.css';

const END_AT = '2026-11-30T18:29:59+05:30';

const COUPONS = [
  {
    code: 'WELCOME10',
    discount: '10% OFF',
    type: 'Instant Cart Discount',
    condition: 'On min. bag value ₹5,000 (Max discount ₹1,500)',
  },
  {
    code: 'RIDDHY500',
    discount: '₹500 OFF',
    type: 'Flat Festive Voucher',
    condition: 'On all orders above ₹10,000 across furniture & appliances',
  },
  {
    code: 'WEDDING15',
    discount: 'EXTRA 15%',
    type: 'Package Privilege',
    condition: 'Valid on complete 2-3 BHK Marriage & Appliance Packages',
  },
];

const CAMPAIGNS = [
  {
    tag: 'Marriage Season',
    title: 'Complete Wedding Packages',
    desc: 'Handcrafted bedroom, hall & inverter appliances from ₹89,999.',
    href: '/packages',
    cta: 'View Packages',
  },
  {
    tag: 'Appliance Carnival',
    title: 'Inverter Refrigerators & ACs',
    desc: '5-Star certified efficiency with complimentary installation.',
    href: '/appliances',
    cta: 'Shop Appliances',
  },
  {
    tag: 'Solid Wood Heritage',
    title: 'Living & Dining Sets',
    desc: 'Teak & Sheesham furniture crafted for generations with 5-Yr warranty.',
    href: '/furniture',
    cta: 'Shop Furniture',
  },
];

function OffersModalInner() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = useSelector((state) => state.ui?.offersModalOpen);
  const [copiedCode, setCopiedCode] = useState(null);

  // Auto-open on initial website load (once per session)
  useEffect(() => {
    // If explicitly opened via query parameter (e.g. ?offers=1)
    if (searchParams?.get('offers') === '1' || searchParams?.get('openOffers') === 'true') {
      dispatch(setOffersModal(true));
      return;
    }

    try {
      const isDismissed = sessionStorage.getItem('rf_offer_dismissed');
      if (!isDismissed) {
        // Show after smooth delay so website loads first, then popup appears
        const timer = setTimeout(() => {
          try {
            if (!sessionStorage.getItem('rf_offer_dismissed')) {
              dispatch(setOffersModal(true));
            }
          } catch {}
        }, 850);

        return () => clearTimeout(timer);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [searchParams, dispatch]);

  const handleClose = () => {
    try {
      sessionStorage.setItem('rf_offer_dismissed', 'true');
    } catch {}
    dispatch(setOffersModal(false));
  };

  // Lock body scroll & close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      dispatch(
        showToast({
          message: `Coupon code "${code}" copied to clipboard!`,
          kind: 'success',
        })
      );
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleNavigate = (href) => {
    handleClose();
    router.push(href);
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="offers-modal-title"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close offers pop-up"
        >
          <Icon name="close" size={18} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.kicker}>
            <span>✨ Seasonal Deals & Store Offers</span>
          </div>
          <h2 id="offers-modal-title" className={styles.title}>
            Exclusive Deals & Instant Coupons
          </h2>
          <p className={styles.subtitle}>
            Use verified discount codes at checkout or explore current festive campaign collections.
          </p>
        </div>

        {/* Hero Featured Campaign Banner */}
        <div className={styles.heroBanner}>
          <div className={styles.heroTag}>
            <span className={styles.heroTagDot} />
            <span>The Golden Hour Celebration · Limited Time</span>
          </div>
          <h3 className={styles.heroTitle}>
            Up to 40% Off Handcrafted Living & <em>Smart Appliances</em>
          </h3>
          <p className={styles.heroDesc}>
            Warm Sheesham textures, solid teak dining, and 5-star inverter technology curated for complete homes.
          </p>

          <Countdown endsAt={END_AT} />

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.heroPrimaryBtn}
              onClick={() => handleNavigate('/furniture')}
            >
              Shop Furniture Deals <Icon name="arrow" size={14} />
            </button>
            <button
              type="button"
              className={styles.heroSecondaryBtn}
              onClick={() => handleNavigate('/appliances')}
            >
              Shop Appliances <Icon name="arrowUpRight" size={13} />
            </button>
          </div>
        </div>

        {/* Discount Coupons Grid */}
        <div className={styles.couponsSection}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>
              <Icon name="tag" size={15} />
              <span>Available Coupon Codes</span>
            </h4>
          </div>

          <div className={styles.couponsGrid}>
            {COUPONS.map((coupon) => (
              <div key={coupon.code} className={styles.couponCard}>
                <div>
                  <div className={styles.couponDiscount}>
                    {coupon.discount}
                    <small>{coupon.type}</small>
                  </div>
                  <p className={styles.couponCondition}>{coupon.condition}</p>
                </div>

                <div className={styles.couponFooter}>
                  <span className={styles.couponCode}>{coupon.code}</span>
                  <button
                    type="button"
                    className={`${styles.copyBtn} ${
                      copiedCode === coupon.code ? styles.copiedText : ''
                    }`}
                    onClick={() => handleCopyCode(coupon.code)}
                  >
                    {copiedCode === coupon.code ? (
                      <>✓ Copied</>
                    ) : (
                      <>
                        <Icon name="copy" size={13} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Campaign Tiles */}
        <div className={styles.campaignsRow}>
          {CAMPAIGNS.map((item) => (
            <div
              key={item.title}
              className={styles.campaignCard}
              onClick={() => handleNavigate(item.href)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <span className={styles.campaignCardTag}>{item.tag}</span>
                <h5 className={styles.campaignCardTitle}>{item.title}</h5>
                <p className={styles.campaignCardDesc}>{item.desc}</p>
              </div>
              <span className={styles.campaignCardLink}>
                {item.cta} <Icon name="arrow" size={12} />
              </span>
            </div>
          ))}
        </div>

        {/* Trust assurance bar */}
        <div className={styles.trustBar}>
          <span className={styles.trustItem}>
            🚚 Free Delivery & Setup in Delhi-NCR
          </span>
          <span className={styles.trustItem}>
            🛡️ 5-Year Structural Warranty
          </span>
          <span className={styles.trustItem}>
            💳 0% Easy EMI Available
          </span>
          <span className={styles.trustItem}>
            💬 Certified Expert Advice
          </span>
        </div>

        <div className={styles.dismissRow}>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={handleClose}
          >
            <span>Close & Continue Shopping</span>
            <Icon name="arrow" size={13} className={styles.dismissIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersModal() {
  return (
    <Suspense fallback={null}>
      <OffersModalInner />
    </Suspense>
  );
}
