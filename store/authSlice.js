import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  checked: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, { payload }) {
      state.user = payload?.user || null;
      state.isAuthenticated = Boolean(payload?.authenticated);
      state.checked = true;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.checked = true;
    }
  }
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
