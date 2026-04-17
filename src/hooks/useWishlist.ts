import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { wishlistService } from '../features/wishlist/wishlistService';
import { clearWishlist, setWishlistItems } from '../features/wishlist/wishlistSlice';
import type { ProductResponse, WishlistItem } from '../types';

const syncWishlist = (dispatch: ReturnType<typeof useAppDispatch>, items: WishlistItem[]) => {
  wishlistService.saveWishlistItems(items);
  dispatch(setWishlistItems(items));
};

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlist.items);

  const isInWishlist = useCallback(
    (productId: number) => items.some((item) => item.productId === productId),
    [items]
  );

  const addToWishlist = useCallback(
    (product: ProductResponse) => {
      if (items.some((item) => item.productId === product.id)) return;
      const nextItems = [...items, wishlistService.toWishlistItem(product)];
      syncWishlist(dispatch, nextItems);
    },
    [dispatch, items]
  );

  const removeFromWishlist = useCallback(
    (productId: number) => {
      const nextItems = items.filter((item) => item.productId !== productId);
      syncWishlist(dispatch, nextItems);
    },
    [dispatch, items]
  );

  const toggleWishlist = useCallback(
    (product: ProductResponse) => {
      if (items.some((item) => item.productId === product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [addToWishlist, items, removeFromWishlist]
  );

  const clearAll = useCallback(() => {
    wishlistService.clearWishlist();
    dispatch(clearWishlist());
  }, [dispatch]);

  return {
    items,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearAll,
  };
};
