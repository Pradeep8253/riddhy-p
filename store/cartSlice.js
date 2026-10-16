import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };
const cartSlice = createSlice({
  name: 'cart', initialState,
  reducers: {
    addItem(state, { payload }) {
      const key = payload.variantId || payload.slug || payload.id;
      const found = state.items.find((item) => (item.variantId || item.slug || item.id) === key);
      if (found) found.qty += Math.max(1, Number(payload.qty) || 1);
      else state.items.push({ ...payload, qty: Math.max(1, Number(payload.qty) || 1) });
    },
    setQuantity(state, { payload: { key, qty } }) {
      const item = state.items.find((entry) => (entry.variantId || entry.slug || entry.id) === key);
      if (!item) return;
      if (qty <= 0) state.items = state.items.filter((entry) => entry !== item);
      else item.qty = Math.min(99, Math.floor(qty));
    },
    removeItem(state, { payload: key }) { state.items = state.items.filter((item) => (item.variantId || item.slug || item.id) !== key); },
    clearCart(state) { state.items = []; },
    rehydrate(state, { payload }) { state.items = Array.isArray(payload?.items) ? payload.items : []; }
  }
});
export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
