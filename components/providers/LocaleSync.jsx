'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLocale } from '@/store/uiSlice';

export default function LocaleSync() {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z\-]+)/);
      const cookieLang = match ? match[1] : null;
      const saved = cookieLang || window.localStorage.getItem('rf-locale');
      if (saved && saved !== locale) {
        dispatch(setLocale(saved));
      }
    } catch {}
  }, [dispatch, locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale || 'en';
    }
  }, [locale]);

  return null;
}
