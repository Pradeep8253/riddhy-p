import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locale: 'en',
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

export const { setLocale, setCartDrawer, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

