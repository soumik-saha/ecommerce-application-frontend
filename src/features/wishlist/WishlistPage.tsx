import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { cartService } from '../cart/cartService';
import { useAppDispatch } from '../../app/hooks';
import { setCartItems } from '../cart/cartSlice';
import { Button } from '../../components/ui/Button';
import { parseError } from '../../utils/errorParser';

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, removeFromWishlist, clearAll } = useWishlist();

  const handleAddToCart = async (productId: number) => {
    try {
      const cart = await cartService.addToCart(productId, 1);
      dispatch(setCartItems(cart.items));
      toast.success('Added to cart');
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-pink-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="mt-2 text-gray-500">Save items you love and come back to them later.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">Keep track of your favorite products.</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Clear wishlist
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <Link to={`/products/${item.productId}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                <p className="mt-1 font-medium text-gray-900">${item.price.toFixed(2)}</p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => handleAddToCart(item.productId)}
              >
                <ShoppingCart size={16} /> Add to cart
              </Button>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
