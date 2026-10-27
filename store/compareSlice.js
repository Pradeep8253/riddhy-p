import { createSlice } from "@reduxjs/toolkit";
const compareSlice = createSlice({
  name: "compare",
  initialState: { items: [] },
  reducers: {
    toggleCompare(state, { payload }) {
      const key = payload.slug || payload.id;
      const exists = state.items.some((item) => (item.slug || item.id) === key);
      if (exists)
        state.items = state.items.filter(
          (item) => (item.slug || item.id) !== key,
        );
      else if (state.items.length < 4) state.items.push(payload);
    },
    removeCompareItem(state, { payload: key }) {
      state.items = state.items.filter(
        (item) => (item.slug || item.id) !== key,
      );
    },
    clearCompare(state) {
      state.items = [];
    },
    rehydrate(state, { payload }) {
      state.items = Array.isArray(payload?.items)
        ? payload.items.slice(0, 4)
        : [];
    },
  },
});
export const { toggleCompare, removeCompareItem, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;
