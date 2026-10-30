'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setOffersModal } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import styles from './OffersModal.module.css';

function OffersModalInner() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const isOpen = useSelector((state) => state.ui?.offersModalOpen);
  const [banner, setBanner] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/banners?zone=popupbanner', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        const rows = Array.isArray(json) ? json : (json?.data || []);
        if (mounted) setBanner(rows.find((item) => item.active !== false && (item.desktopImage || item.mobileImage)) || null);
      })
      .catch(() => { if (mounted) setBanner(null); })
      .finally(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loaded || !banner) return;
    if (searchParams?.get('offers') === '1' || searchParams?.get('openOffers') === 'true') {
      dispatch(setOffersModal(true));
      return;
    }
    try {
      if (!sessionStorage.getItem('rf_offer_dismissed')) {
        const timer = setTimeout(() => {
          if (!sessionStorage.getItem('rf_offer_dismissed')) dispatch(setOffersModal(true));
        }, 900);
        return () => clearTimeout(timer);
      }
    } catch { /* session storage may be unavailable */ }
  }, [loaded, banner, searchParams, dispatch]);

  const close = useCallback((event) => {
    event?.stopPropagation();
    try { sessionStorage.setItem('rf_offer_dismissed', 'true'); } catch { /* ignore */ }
    dispatch(setOffersModal(false));
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen || !banner) return null;
  const image = banner.desktopImage || banner.mobileImage;
  return (
    <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true" aria-label="Promotional banner">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close popup banner">
          <Icon name="close" size={17} />
        </button>
        <img src={image} alt={banner.alt || 'Promotional banner'} className={styles.bannerImage} />
      </div>
    </div>
  );
}

export default function OffersModal() {
  return <Suspense fallback={null}><OffersModalInner /></Suspense>;
}
