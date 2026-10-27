import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  locale: "en",
  liteMode: false,
  cartDrawerOpen: false,
  offersModalOpen: false,
  toast: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLocale(state) {
      state.locale = "en";
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("rf-locale", "en");
          document.cookie =
            "rf-locale=en; path=/; max-age=31536000; SameSite=Lax";
          document.cookie =
            "rf_locale=en; path=/; max-age=31536000; SameSite=Lax";
        } catch {}
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
    setOffersModal(state, { payload }) {
      state.offersModalOpen = Boolean(payload);
    },
    showToast(state, { payload }) {
      state.toast = { ...payload, id: Date.now() };
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  setLocale,
  setLiteMode,
  toggleLiteMode,
  setCartDrawer,
  setOffersModal,
  showToast,
  clearToast,
} = uiSlice.actions;
export default uiSlice.reducer;
