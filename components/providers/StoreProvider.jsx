'use client';

import { Provider } from 'react-redux';
import { useEffect, useRef } from 'react';
import { makeStore } from '@/store/store';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    try {
      const savedLocale = window.localStorage.getItem('rf-locale');
      if (savedLocale === 'hi') {
        window.localStorage.setItem('rf-locale', 'en');
        document.cookie = 'rf-locale=en; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'rf_locale=en; path=/; max-age=31536000; SameSite=Lax';
      }
      store.dispatch({ type: 'ui/setLocale', payload: 'en' });

      const saved = window.localStorage.getItem('rf-riddhy-state');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.cart) {
          store.dispatch({ type: 'cart/rehydrate', payload: state.cart });
        }
        if (state.wishlist) {
          store.dispatch({ type: 'wishlist/rehydrate', payload: state.wishlist });
        }
        if (state.compare) {
          store.dispatch({ type: 'compare/rehydrate', payload: state.compare });
        }
      }
    } catch {
      window.localStorage.removeItem('rf-riddhy-state');
    }

    const syncAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (json.success && json.data?.authenticated) {
          store.dispatch({ type: 'auth/setAuth', payload: json.data });
        } else {
          store.dispatch({ type: 'auth/clearAuth' });
        }
      } catch {
        store.dispatch({ type: 'auth/clearAuth' });
      }
    };

    syncAuth();
    window.addEventListener('rf-auth-change', syncAuth);

    const unsubscribe = store.subscribe(() => {
      try {
        const state = store.getState();
        window.localStorage.setItem(
          'rf-riddhy-state',
          JSON.stringify({
            cart: state.cart,
            wishlist: state.wishlist,
            compare: state.compare,
            ui: { locale: state.ui?.locale }
          })
        );
        if (state.ui?.locale) {
          window.localStorage.setItem('rf-locale', state.ui.locale);
        }
      } catch {
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('rf-auth-change', syncAuth);
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}

