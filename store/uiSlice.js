import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locale: 'en',
  liteMode: false,
  cartDrawerOpen: false,
  toast: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLocale(state, { payload }) {
      const next = payload === 'hi' ? 'hi' : 'en';
      state.locale = next;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('rf-locale', next);
          document.cookie = `rf-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // Ignore storage quota/permission issues
        }
      }
    },
    setLiteMode(state, { payload }) {
      state.liteMode = Boolean(payload);
    },
    toggleLiteMode(state) {
      state.liteMode = !state.liteMode;
    },
    setCartDrawer(state, { payload }) {
      state.cartDrawerOpen = Boolean(payload);
    },
    showToast(state, { payload }) {
      state.toast = { ...payload, id: Date.now() };
    },
    clearToast(state) {
      state.toast = null;
    }
  }
});

export const { setLocale, setLiteMode, toggleLiteMode, setCartDrawer, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

