import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from './productService';
import { cartService } from '../cart/cartService';
import { useAppDispatch } from '../../app/hooks';
import { setCartItems } from '../cart/cartSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';
import type { ProductResponse } from '../../types';
import ProductCard from './ProductCard';

const PAGE_SIZE = 12;

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [page, setPage] = useState(0);
  const debouncedKeyword = useDebounce(keyword, 400);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', debouncedKeyword, page],
    queryFn: () => productService.getProducts(debouncedKeyword, page, PAGE_SIZE),
  });

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(0);
    if (value) {
      setSearchParams({ keyword: value });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = async (product: ProductResponse) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      const cart = await cartService.addToCart(product.id, 1);
      dispatch(setCartItems(cart.items));
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-gray-500">Discover our amazing collection</p>
      </div>

      <div className="mb-6 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="Search products by name..."
          className="w-full max-w-md rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 mb-6">
          {parseError(error)}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : data?.content.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <span className="text-6xl mb-4">🔍</span>
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.content.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page === data.totalPages - 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
