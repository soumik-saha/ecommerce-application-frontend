import axiosInstance from '../../services/axiosInstance';
import type { Order } from '../../types';

export const orderService = {
  async placeOrder(): Promise<Order> {
    const response = await axiosInstance.post<Order>('\/api\/orders');
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('\/api\/orders');
    return response.data;
  },
};
