import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  loading: false,
};

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.totalAmount = calculateTotal(action.payload);
      state.loading = false;
    },
    addCartItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = calculateTotal(state.items);
    },
    removeCartItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      state.totalAmount = calculateTotal(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setCartItems, addCartItem, removeCartItem, clearCart, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
