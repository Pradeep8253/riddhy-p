'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
export default function LocaleSync() {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  useEffect(() => {
    document.documentElement.lang = 'en';
    try {
      window.localStorage.setItem('rf-locale', 'en');
      document.cookie = 'rf-locale=en; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'rf_locale=en; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
  }, []);
  return null;
}
