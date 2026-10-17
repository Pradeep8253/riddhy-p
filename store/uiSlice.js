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
      state.locale = payload === 'hi' ? 'hi' : 'en';
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

