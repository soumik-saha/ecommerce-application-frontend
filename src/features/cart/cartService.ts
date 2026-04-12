import axiosInstance from '../../services/axiosInstance';
import type { CartResponse } from '../../types';
import { logger } from '../../utils/logger';

type RawCartProduct = {
  id?: number;
  name?: string;
  price?: number;
  imageUrl?: string;
};

type RawCartItem = {
  productId?: number;
  productName?: string;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  quantity?: number;
  imageUrl?: string;
  product?: RawCartProduct;
};

type RawCartResponse = {
  items?: RawCartItem[];
  totalAmount?: number;
  data?: unknown;
  cart?: unknown;
};

const normalizeCartItem = (item: RawCartItem) => ({
  productId: item.productId ?? item.product?.id ?? 0,
  productName: item.productName ?? item.product?.name ?? 'Product',
  price: item.product?.price ?? item.unitPrice ?? item.price ?? 0,
  quantity: item.quantity ?? 0,
  imageUrl: item.imageUrl ?? item.product?.imageUrl,
});

const normalizeCartResponse = (payload: unknown): CartResponse => {
  const rawItems = (
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as RawCartResponse).items)
        ? (payload as RawCartResponse).items
        : payload && typeof payload === 'object' && Array.isArray((payload as RawCartResponse).data)
          ? (payload as RawCartItem[])
          : payload && typeof payload === 'object' && Array.isArray((payload as RawCartResponse).cart)
            ? (payload as RawCartItem[])
            : []
  ) ?? [];

  const items = rawItems.map(normalizeCartItem).filter((item) => item.productId > 0 && item.quantity > 0);

  const explicitTotalAmount =
    payload && typeof payload === 'object' && typeof (payload as RawCartResponse).totalAmount === 'number'
      ? (payload as RawCartResponse).totalAmount
      : undefined;

  return {
    items,
    totalAmount: explicitTotalAmount ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
};

export const cartService = {
  async getCart(): Promise<CartResponse> {
    logger.debug('Loading cart state');
    try {
      const response = await axiosInstance.get<CartResponse>('/api/cart');
      const cart = normalizeCartResponse(response.data);
      logger.debug('Cart loaded', {
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount,
      });
      return cart;
    } catch (error) {
      logger.error('Failed to load cart', error);
      throw error;
    }
  },

  async addToCart(productId: number, quantity: number): Promise<CartResponse> {
    logger.info('Add to cart requested', { productId, quantity });
    try {
      await axiosInstance.post<CartResponse>('/api/cart', { productId, quantity });
      const cart = await this.getCart();
      logger.info('Add to cart succeeded', {
        productId,
        quantity,
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount,
      });
      return cart;
    } catch (error) {
      logger.error('Add to cart failed', error, { productId, quantity });
      throw error;
    }
  },

  async removeFromCart(productId: number): Promise<void> {
    logger.info('Remove from cart requested', { productId });
    try {
      await axiosInstance.delete(`/api/cart/items/${productId}`);
      logger.info('Remove from cart succeeded', { productId });
    } catch (error) {
      logger.error('Remove from cart failed', error, { productId });
      throw error;
    }
  },
};
