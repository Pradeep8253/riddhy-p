'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setOffersModal, showToast } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { getWhatsAppUrl } from '@/lib/site-config';
import { IMG } from '@/lib/images';
import styles from './OffersModal.module.css';

const DEFAULT_OFFER_CODE = 'DIWALI10';
const DEFAULT_OFFER_TEXT =
  'Hello RF Riddhy! 🪔 I saw your Diwali Dhamaka Offer on the website. I want to avail offer code "DIWALI10" for furniture & home appliances. Please share the exclusive Diwali discounts, offers and package pricing!';

function OffersModalInner({
  offerCode = DEFAULT_OFFER_CODE,
  offerMessage = DEFAULT_OFFER_TEXT,
  bannerImage = IMG?.banners?.diwaliBanner || '/images/diwali-dhamaka-banner.jpg',
  altText = 'RF Riddhy Diwali Dhamaka Offer - Luxury Teak Furniture & Smart Home Appliances',
}) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const isOpen = useSelector((state) => state.ui?.offersModalOpen);
  const [copied, setCopied] = useState(false);

  // Auto-open on initial website load (once per session)
  useEffect(() => {
    // If explicitly opened via query parameter (e.g. ?offers=1 or ?openOffers=true)
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
          } catch { }
        }, 900);

        return () => clearTimeout(timer);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [searchParams, dispatch]);

  const handleClose = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      try {
        sessionStorage.setItem('rf_offer_dismissed', 'true');
      } catch { }
      dispatch(setOffersModal(false));
    },
    [dispatch]
  );

  // Redirect to WhatsApp with pre-filled Diwali Dhamaka message
  const handleBannerClick = useCallback(() => {
    const waUrl = getWhatsAppUrl(offerMessage);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }, [offerMessage]);

  // Copy offer code with instant visual feedback and toast
  const handleCopyCode = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      try {
        navigator.clipboard.writeText(offerCode);
        setCopied(true);
        dispatch(
          showToast({
            message: `Diwali coupon code "${offerCode}" copied to clipboard!`,
            kind: 'success',
          })
        );
        setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [offerCode, dispatch]
  );

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
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali Dhamaka Offer"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Cross sign to close */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close offer pop-up"
        >
          <Icon name="close" size={17} />
        </button>

        {/* Clickable Image Banner -> Redirects to WhatsApp */}
        <div
          className={styles.bannerWrapper}
          onClick={handleBannerClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBannerClick();
            }
          }}
          title="Click banner to chat on WhatsApp and claim Diwali Dhamaka Deals"
        >
          <div className={styles.imageContainer}>
            <img
              src={bannerImage}
              alt={altText}
              className={styles.bannerImage}
              loading="eager"
            />

            {/* Radiant festive gradient overlay */}
            <div className={styles.bannerOverlay} />

            {/* Banner Content / Callouts */}
            <div className={styles.bannerContent}>
              <div className={styles.topBadge}>
                <span className={styles.badgePulse} />
                <span>🪔 DIWALI DHAMAKA SALE</span>
              </div>

              <div className={styles.bannerBottom}>
                <h2 className={styles.bannerTitle}>
                  Diwali Dhamaka <em>Offer</em>
                </h2>
                <p className={styles.bannerSubtitle}>
                  Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech
                </p>

                <div className={styles.waPill}>
                  <Icon name="whatsapp" size={16} color="#25D366" />
                  <span>Tap to Claim on WhatsApp</span>
                  <Icon name="arrowRight" size={13} className={styles.waPillArrow} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fancy Strip below the banner */}
        <div className={styles.fancyStrip}>
          <div className={styles.stripLeft}>
            <span className={styles.stripIconWrap}>
              <Icon name="sparkles" size={17} />
            </span>
            <div className={styles.stripText}>
              <span className={styles.stripLabel}>Diwali Dhamaka Code</span>
              <span className={styles.stripDesc}>
                Instant 10% OFF + Free Delivery & Setup in Prayagraj
              </span>
            </div>
          </div>

          <div className={styles.stripRight}>
            <div className={styles.codeContainer} title="Diwali Coupon Code">
              <span className={styles.offerCode}>{offerCode}</span>
            </div>

            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopyCode}
              aria-label="Copy Diwali offer code"
            >
              {copied ? (
                <>
                  <Icon name="check" size={13} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Icon name="copy" size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OffersModal(props) {
  return (
    <Suspense fallback={null}>
      <OffersModalInner {...props} />
    </Suspense>
  );
}
