import { createSlice } from '@reduxjs/toolkit';
const wishlistSlice = createSlice({
  name: 'wishlist', initialState: { items: [] },
  reducers: {
    toggleWishlist(state, { payload }) {
      const key = payload.slug || payload.id;
      const exists = state.items.some((item) => (item.slug || item.id) === key);
      state.items = exists ? state.items.filter((item) => (item.slug || item.id) !== key) : [...state.items, payload];
    },
    removeWishlistItem(state, { payload: key }) { state.items = state.items.filter((item) => (item.slug || item.id) !== key); },
    clearWishlist(state) { state.items = []; },
    rehydrate(state, { payload }) { state.items = Array.isArray(payload?.items) ? payload.items : []; }
  }
});
export const { toggleWishlist, removeWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
