import { CartItem, CartState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  paymentType: "cash",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const product = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        // state.items.push(action.payload);
        state.items.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          quantity: 1,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId,
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.paymentType = "cash";
      state.mixedPayment = undefined;
    },
    setPaymentType: (state, action: PayloadAction<"cash" | "qr" | "mixed">) => {
      state.paymentType = action.payload;
    },
    setMixedPayment: (
      state,
      action: PayloadAction<{ cash: number; qr: number }>,
    ) => {
      state.mixedPayment = action.payload;
    },
    updateCartItems: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setPaymentType,
  setMixedPayment,
  updateCartItems,
} = cartSlice.actions;
export default cartSlice.reducer;
