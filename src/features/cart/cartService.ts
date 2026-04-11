import axiosInstance from '../../services/axiosInstance';
import type { CartResponse } from '../../types';

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await axiosInstance.get<CartResponse>('\/api\/cart');
    return response.data;
  },

  async addToCart(productId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosInstance.post<CartResponse>('\/api\/cart', { productId, quantity });
    return response.data;
  },

  async removeFromCart(productId: number): Promise<void> {
    await axiosInstance.delete(`\/api\/cart\/items\/${productId}`);
  },
};
