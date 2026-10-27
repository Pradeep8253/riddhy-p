import { configureStore } from "@reduxjs/toolkit";
import cart from "./cartSlice";
import wishlist from "./wishlistSlice";
import compare from "./compareSlice";
import ui from "./uiSlice";
import auth from "./authSlice";

export function makeStore() {
  return configureStore({
    reducer: { cart, wishlist, compare, ui, auth },
    devTools: process.env.NODE_ENV !== "production",
  });
}
