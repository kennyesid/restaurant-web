import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  paymentType: 'cash' | 'qr' | 'mixed';
  mixedPayment?: {
    cash: number;
    qr: number;
  };
}

const initialState: CartState = {
  items: [],
  paymentType: 'cash',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.paymentType = 'cash';
      state.mixedPayment = undefined;
    },
    setPaymentType: (state, action: PayloadAction<'cash' | 'qr' | 'mixed'>) => {
      state.paymentType = action.payload;
    },
    setMixedPayment: (state, action: PayloadAction<{ cash: number; qr: number }>) => {
      state.mixedPayment = action.payload;
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
} = cartSlice.actions;
export default cartSlice.reducer;
