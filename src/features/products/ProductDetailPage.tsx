import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from './productService';
import { cartService } from '../cart/cartService';
import { useAppDispatch } from '../../app/hooks';
import { setCartItems } from '../cart/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!product) return;
    try {
      setAddingToCart(true);
      const cart = await cartService.addToCart(product.id, quantity);
      dispatch(setCartItems(cart.items));
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setAddingToCart(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-600">{parseError(error)}</p>
        <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} /> Back to products
      </button>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : product ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`;
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🛍️</div>
            )}
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">{product.category}</span>
            )}
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
            <p className="mt-6 text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>

            <div className="mt-2 text-sm">
              {product.stockQuantity > 0 ? (
                <span className="text-green-600 font-medium">{product.stockQuantity} in stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of stock</span>
              )}
            </div>

            {product.stockQuantity > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="p-2 hover:bg-gray-100 rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={product.stockQuantity === 0}
              className="mt-6 gap-2 w-full sm:w-auto"
              size="lg"
            >
              <ShoppingCart size={20} />
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailPage;
