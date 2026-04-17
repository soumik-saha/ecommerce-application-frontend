import type { ProductReview } from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'shopapp-product-reviews';

type ReviewStore = Record<string, ProductReview[]>;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safelyParseReviews = (raw: string | null): ReviewStore => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ReviewStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    logger.warn('Failed to parse product reviews', { error });
    return {};
  }
};

const saveStore = (store: ReviewStore) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const generateId = () =>
  typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const reviewService = {
  getReviews(productId: number): ProductReview[] {
    if (!canUseStorage()) return [];
    const store = safelyParseReviews(window.localStorage.getItem(STORAGE_KEY));
    return store[productId] ?? [];
  },

  addReview(productId: number, review: Omit<ProductReview, 'id' | 'createdAt' | 'productId'>): ProductReview[] {
    if (!canUseStorage()) return [];
    const store = safelyParseReviews(window.localStorage.getItem(STORAGE_KEY));
    const nextReview: ProductReview = {
      ...review,
      id: generateId(),
      productId,
      createdAt: new Date().toISOString(),
    };
    const nextReviews = [...(store[productId] ?? []), nextReview];
    store[productId] = nextReviews;
    saveStore(store);
    return nextReviews;
  },
};
