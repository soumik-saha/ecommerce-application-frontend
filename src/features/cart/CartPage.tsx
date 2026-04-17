import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartService } from './cartService';
import { useAppDispatch } from '../../app/hooks';
import { setCartItems, removeCartItem } from './cartSlice';
import { useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const [updatingProductId, setUpdatingProductId] = React.useState<number | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await cartService.getCart();
      dispatch(setCartItems(cart.items));
      return cart;
    },
  });

  const handleRemove = async (productId: number) => {
    try {
      await cartService.removeFromCart(productId);
      dispatch(removeCartItem(productId));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleQuantityChange = async (productId: number, currentQuantity: number, nextQuantity: number) => {
    setUpdatingProductId(productId);
    try {
      const cart = await cartService.updateCartItemQuantity(productId, currentQuantity, nextQuantity);
      dispatch(setCartItems(cart.items));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setUpdatingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <ShoppingBag size={64} className="mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-sm">Add some products to get started</p>
          <Link to="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-white text-sm font-medium hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-2 py-1">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity - 1)}
                      disabled={updatingProductId === item.productId}
                      className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      aria-label={`Decrease ${item.productName} quantity`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity + 1)}
                      disabled={updatingProductId === item.productId}
                      className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      aria-label={`Increase ${item.productName} quantity`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={updatingProductId === item.productId}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <Button
              onClick={() => navigate('/payment')}
              className="mt-4 w-full"
              size="lg"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
