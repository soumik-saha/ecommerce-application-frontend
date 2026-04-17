import axiosInstance from '../../services/axiosInstance';
import type { Order, Page } from '../../types';
import { logger } from '../../utils/logger';

const normalizeOrderList = (payload: unknown): Order[] => {
  if (Array.isArray(payload)) {
    return payload as Order[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as Page<Order>).content)) {
    return (payload as Page<Order>).content;
  }

  return [];
};

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
      const response = await axiosInstance.get<Order[] | Page<Order>>('/api/orders');
      return normalizeOrderList(response.data);
    } catch (error) {
      logger.error('Failed to load orders', error);
      throw error;
    }
  },

  async getMyOrders(page = 0, size = 10): Promise<Page<Order>> {
    logger.debug('Loading customer orders', { page, size });
    try {
      const response = await axiosInstance.get<Order[] | Page<Order>>('/api/orders', {
        params: { page, size },
      });

      if (response.data && typeof response.data === 'object' && Array.isArray((response.data as Page<Order>).content)) {
        return response.data as Page<Order>;
      }

      const orders = normalizeOrderList(response.data);
      const totalElements = orders.length;
      const normalizedSize = size > 0 ? size : 10;
      const totalPages = Math.max(1, Math.ceil(totalElements / normalizedSize));
      const start = page * normalizedSize;

      return {
        content: orders.slice(start, start + normalizedSize),
        totalElements,
        totalPages,
        number: page,
        size: normalizedSize,
        first: page === 0,
        last: page >= totalPages - 1,
      };
    } catch (error) {
      logger.error('Failed to load customer orders', error, { page, size });
      throw error;
    }
  },
};
