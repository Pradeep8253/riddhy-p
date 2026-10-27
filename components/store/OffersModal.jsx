'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setOffersModal, showToast } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { getWhatsAppUrl } from '@/lib/site-config';
import styles from './OffersModal.module.css';

const DEFAULT_OFFER_CODE = 'DIWALI10';
const DEFAULT_OFFER_TEXT =
  'Hello RF Riddhy! 🪔 I saw your Diwali Dhamaka Offer on the website. I want to avail offer code "DIWALI10" for furniture & home appliances. Please share the exclusive Diwali discounts, offers and package pricing!';

function OffersModalInner({
  offerCode: propOfferCode,
  offerMessage: propOfferMessage,
  bannerImage: propBannerImage,
  altText: propAltText,
}) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const isOpen = useSelector((state) => state.ui?.offersModalOpen);
  const [copied, setCopied] = useState(false);
  const [bannerData, setBannerData] = useState(null);

  // Fetch active promotional banner dynamically from CMS
  useEffect(() => {
    fetch('/api/banners?zone=offers-modal', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : (json?.data || []);
        if (list.length > 0) {
          setBannerData(list[0]);
        }
      })
      .catch(() => {});
  }, []);

  const offerCode = bannerData?.offerCode || propOfferCode || DEFAULT_OFFER_CODE;
  const campaignTag = bannerData?.campaignTag || '🪔 DIWALI DHAMAKA SALE';
  const title = bannerData?.title || 'Diwali Dhamaka Offer';
  const subtitle = bannerData?.subtitle || 'Celebrate with Up to 40% OFF Handcrafted Teak & Smart Inverter Tech';
  const offerDesc = bannerData?.offerDescription || 'Instant 10% OFF + Free Delivery & Setup in Prayagraj';
  const bannerImage = bannerData?.desktopImage || propBannerImage || '/images/diwali-dhamaka-banner.jpg';
  const altText = bannerData?.alt || propAltText || `${title} - RF Riddhy Exclusive Offers`;
  const ctaText = bannerData?.ctaText || 'Tap to Claim on WhatsApp';
  const destinationHref = bannerData?.href;

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

  // Direct WhatsApp click handler to chat directly with RF Riddhy
  const handleClaimWhatsApp = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const customMessage = `Hello RF Riddhy! 🪔 I saw your "${title}" on the website. I want to avail offer code "${offerCode}" for furniture & home appliances (${offerDesc}). Please share the exclusive discounts and package pricing!`;
      const waUrl = getWhatsAppUrl(propOfferMessage || customMessage);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    },
    [title, offerCode, offerDesc, propOfferMessage]
  );

  // Click on the overall banner image
  const handleBannerClick = useCallback(
    (e) => {
      if (
        destinationHref &&
        destinationHref.startsWith('http') &&
        !destinationHref.includes('wa.me') &&
        !destinationHref.includes('whatsapp')
      ) {
        window.open(destinationHref, '_blank', 'noopener,noreferrer');
        dispatch(setOffersModal(false));
        return;
      }

      // Default: Direct WhatsApp chat to claim offer!
      handleClaimWhatsApp(e);
    },
    [destinationHref, handleClaimWhatsApp, dispatch]
  );

  // Copy offer code with instant visual feedback and toast
  const handleCopyCode = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      try {
        navigator.clipboard.writeText(offerCode);
        setCopied(true);
        dispatch(
          showToast({
            message: `Coupon code "${offerCode}" copied to clipboard!`,
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

  const renderTitle = (text) => {
    if (!text) return null;
    const words = text.trim().split(' ');
    if (words.length <= 1) return text;
    const lastWord = words.pop();
    return (
      <>
        {words.join(' ')} <em>{lastWord}</em>
      </>
    );
  };

  const stripBadgeLabel = campaignTag ? campaignTag.replace(/^[^\w\s]+/, '').trim() : 'Exclusive Offer Code';

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
          title="Click to chat on WhatsApp and claim this offer"
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
                <span>{campaignTag}</span>
              </div>

              <div className={styles.bannerBottom}>
                <h2 className={styles.bannerTitle}>
                  {renderTitle(title)}
                </h2>
                <p className={styles.bannerSubtitle}>
                  {subtitle}
                </p>

                <button
                  type="button"
                  className={styles.waPill}
                  onClick={handleClaimWhatsApp}
                  title="Click to chat directly on WhatsApp and claim this offer"
                  aria-label="Chat on WhatsApp to claim offer"
                >
                  <span className={styles.waIconWrap}>
                    <Icon name="whatsapp" size={16} color="#ffffff" />
                  </span>
                  <span className={styles.waText}>{ctaText || 'Tap to Claim on WhatsApp'}</span>
                  <Icon name="arrowRight" size={13} className={styles.waPillArrow} color="#ffffff" />
                </button>
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
              <span className={styles.stripLabel}>{stripBadgeLabel}</span>
              <span className={styles.stripDesc}>
                {offerDesc}
              </span>
            </div>
          </div>

          <div className={styles.stripRight}>
            <div className={styles.codeContainer} title="Promotional Offer Code">
              <span className={styles.offerCode}>{offerCode}</span>
            </div>

            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopyCode}
              aria-label="Copy offer code"
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
