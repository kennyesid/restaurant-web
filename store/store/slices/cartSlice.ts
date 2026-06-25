import { CartItem, CartState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  paymentType: "cash",
  isCartOpen: true,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const product = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        const newQuantity = action.payload.quantity;
        existingItem.quantity += newQuantity;
        existingItem.subTotal = existingItem.price * existingItem.quantity;
      } else {
        // state.items.push(action.payload);
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isPromotion: product.isPromotion,
          isCountable: product.isCountable,
          productDetailProduct: product.productDetailProduct,
          productId: product.id,
          quantity: 1,
          subTotal: product.price * 1
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (item) {
        item.quantity = action.payload.quantity;
        item.subTotal = item.price * action.payload.quantity;
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
    toggleCartSide: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setToggleCartFalse: (state) => {
      state.isCartOpen = false;
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
  toggleCartSide,
  setToggleCartFalse,
} = cartSlice.actions;
export default cartSlice.reducer;
