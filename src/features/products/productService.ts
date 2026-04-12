import axiosInstance from '../../services/axiosInstance';
import type { Page, ProductRequest, ProductResponse } from '../../types';
import { logger } from '../../utils/logger';

export const productService = {
  async getProducts(keyword = '', page = 0, size = 10): Promise<Page<ProductResponse>> {
    logger.debug('Loading product list', { keyword, page, size });
    try {
      const response = await axiosInstance.get<Page<ProductResponse>>('/api/products', {
        params: { keyword, page, size },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to load product list', error, { keyword, page, size });
      throw error;
    }
  },

  async getProductById(id: number): Promise<ProductResponse> {
    logger.debug('Loading product details', { id });
    try {
      const response = await axiosInstance.get<ProductResponse>(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to load product details', error, { id });
      throw error;
    }
  },

  async searchProducts(keyword: string): Promise<ProductResponse[]> {
    logger.debug('Searching products', { keyword });
    try {
      const response = await axiosInstance.get<ProductResponse[]>('/api/products/search', {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to search products', error, { keyword });
      throw error;
    }
  },

  async createProduct(data: ProductRequest): Promise<ProductResponse> {
    logger.info('Creating product', { name: data.name, price: data.price, stockQuantity: data.stockQuantity });
    try {
      const response = await axiosInstance.post<ProductResponse>('/api/products', data);
      logger.info('Product created', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (error) {
      logger.error('Failed to create product', error, { name: data.name });
      throw error;
    }
  },

  async updateProduct(id: number, data: ProductRequest): Promise<ProductResponse> {
    logger.info('Updating product', { id, name: data.name, price: data.price, stockQuantity: data.stockQuantity });
    try {
      const response = await axiosInstance.put<ProductResponse>(`/api/products/${id}`, data);
      logger.info('Product updated', { id, name: response.data.name });
      return response.data;
    } catch (error) {
      logger.error('Failed to update product', error, { id, name: data.name });
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    logger.info('Deleting product', { id });
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      logger.info('Product deleted', { id });
    } catch (error) {
      logger.error('Failed to delete product', error, { id });
      throw error;
    }
  },
};
