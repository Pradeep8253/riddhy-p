'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
export default function LocaleSync() {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  useEffect(() => {
    document.documentElement.lang = locale === 'hi' ? 'hi' : 'en';
    try {
      window.localStorage.setItem('rf-locale', locale);
      document.cookie = `rf-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, [locale]);
  return null;
}
