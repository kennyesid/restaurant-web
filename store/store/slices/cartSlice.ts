import { CartItem, CartItemDetail, CartState } from "@/types";
import { CartItemDetailDetails } from "@/types/cart/cartItemDetailDetails";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  paymentType: "cash",
  isCartOpen: true,
  editingSaleId: null,
  table: undefined,
  orderType: undefined,
  userCustomerName: undefined,
  userDocument: undefined,
  orderNumber: undefined,
  amountPaid: undefined,
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
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
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
      state.editingSaleId = null;
      state.table = undefined;
      state.orderType = undefined;
      state.userCustomerName = undefined;
      state.userDocument = undefined;
      state.orderNumber = undefined;
      state.amountPaid = undefined;
    },
    startEditSale: (
      state,
      action: PayloadAction<{
        saleId: number;
        items: CartItem[];
        paymentType: "cash" | "qr" | "mixed";
        table?: number;
        orderType?: string;
        userCustomerName?: string;
        userDocument?: string;
        orderNumber?: number;
        amountPaid?: number;
      }>
    ) => {
      state.editingSaleId = action.payload.saleId;
      state.items = action.payload.items;
      state.paymentType = action.payload.paymentType;
      state.table = action.payload.table;
      state.orderType = action.payload.orderType;
      state.userCustomerName = action.payload.userCustomerName;
      state.userDocument = action.payload.userDocument;
      state.orderNumber = action.payload.orderNumber;
      state.amountPaid = action.payload.amountPaid;
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



    updateCartItemDetail: (
      state,
      action: PayloadAction<{
        id: number;
        cartItemDetail: CartItemDetail[];
      }>
    ) => {
      //  console.log("ACTION:", action.payload)
      const item = state.items.find(
        x => x.id === action.payload.id
      );
      // console.log("ITEM ENCONTRADO:", item);
      if (item) {
        item.cartItemDetail = action.payload.cartItemDetail;
      }
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
  updateCartItemDetail,
  startEditSale,
} = cartSlice.actions;
export default cartSlice.reducer;
