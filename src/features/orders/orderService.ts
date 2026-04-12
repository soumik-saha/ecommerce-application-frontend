import axiosInstance from '../../services/axiosInstance';
import type { Order } from '../../types';
import { logger } from '../../utils/logger';

export const orderService = {
  async placeOrder(): Promise<Order> {
    logger.info('Placing order');
    try {
      const response = await axiosInstance.post<Order>('/api/orders');
      logger.info('Order placed', { orderId: response.data.id, totalAmount: response.data.totalAmount });
      return response.data;
    } catch (error) {
      logger.error('Failed to place order', error);
      throw error;
    }
  },

  async getOrders(): Promise<Order[]> {
    logger.debug('Loading orders');
    try {
      const response = await axiosInstance.get<Order[]>('/api/orders');
      return response.data;
    } catch (error) {
      logger.error('Failed to load orders', error);
      throw error;
    }
  },
};
