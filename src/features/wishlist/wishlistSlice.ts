import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WishlistItem } from '../../types';

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { setWishlistItems, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
