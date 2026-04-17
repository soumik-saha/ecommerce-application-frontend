import type { ProductResponse, WishlistItem } from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'shopapp-wishlist';

const safelyParseWishlist = (raw: string | null): WishlistItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.productId === 'number') : [];
  } catch (error) {
    logger.warn('Failed to parse wishlist items', { error });
    return [];
  }
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const wishlistService = {
  getWishlistItems(): WishlistItem[] {
    if (!canUseStorage()) return [];
    return safelyParseWishlist(window.localStorage.getItem(STORAGE_KEY));
  },

  saveWishlistItems(items: WishlistItem[]): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  clearWishlist(): void {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },

  toWishlistItem(product: ProductResponse): WishlistItem {
    return {
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stockQuantity: product.stockQuantity,
      addedAt: new Date().toISOString(),
    };
  },
};
