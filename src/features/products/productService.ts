import axiosInstance from '../../services/axiosInstance';
import type { Page, ProductRequest, ProductResponse } from '../../types';

export const productService = {
  async getProducts(keyword = '', page = 0, size = 10): Promise<Page<ProductResponse>> {
    const response = await axiosInstance.get<Page<ProductResponse>>('\/api\/products', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  async getProductById(id: number): Promise<ProductResponse> {
    const response = await axiosInstance.get<ProductResponse>(`\/api\/products\/${id}`);
    return response.data;
  },

  async searchProducts(keyword: string): Promise<ProductResponse[]> {
    const response = await axiosInstance.get<ProductResponse[]>('\/api\/products\/search', {
      params: { keyword },
    });
    return response.data;
  },

  async createProduct(data: ProductRequest): Promise<ProductResponse> {
    const response = await axiosInstance.post<ProductResponse>('\/api\/products', data);
    return response.data;
  },

  async updateProduct(id: number, data: ProductRequest): Promise<ProductResponse> {
    const response = await axiosInstance.put<ProductResponse>(`\/api\/products\/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await axiosInstance.delete(`\/api\/products\/${id}`);
  },
};
