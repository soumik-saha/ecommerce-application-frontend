import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Minus, Plus, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from './productService';
import { cartService } from '../cart/cartService';
import { useAppDispatch } from '../../app/hooks';
import { setCartItems } from '../cart/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';
import { reviewService } from '../reviews/reviewService';
import type { ProductResponse, ProductReview } from '../../types';
import ProductCard from './ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addNotification } = useNotifications();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', product?.id, product?.category],
    enabled: !!product,
    queryFn: async () => {
      const response = await productService.getProducts('', 0, 12);
      const candidates = response.content.filter((item) => item.id !== product?.id);
      const categoryMatches = product?.category
        ? candidates.filter((item) => item.category === product.category)
        : [];
      const selection = categoryMatches.length > 0 ? categoryMatches : candidates;
      return selection.slice(0, 4);
    },
  });

  React.useEffect(() => {
    if (!product) {
      setReviews([]);
      return;
    }
    setReviews(reviewService.getReviews(product.id));
  }, [product]);

  const addProductToCart = async (
    selectedProduct: ProductResponse,
    quantityToAdd: number,
    withLoadingIndicator = false
  ) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      if (withLoadingIndicator) {
        setAddingToCart(true);
      }
      const cart = await cartService.addToCart(selectedProduct.id, quantityToAdd);
      dispatch(setCartItems(cart.items));
      toast.success(`${selectedProduct.name} added to cart!`);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      if (withLoadingIndicator) {
        setAddingToCart(false);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    void addProductToCart(product, quantity, true);
  };

  const averageRating = React.useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!product) return;
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    const nextReviews = reviewService.addReview(product.id, {
      rating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim() || undefined,
      userName: user?.email ?? 'Anonymous',
    });
    setReviews(nextReviews);
    setRating(0);
    setReviewTitle('');
    setReviewComment('');
    addNotification({
      title: 'Review submitted',
      message: `Thanks for reviewing ${product.name}. Your feedback helps other shoppers.`,
      type: 'review',
      link: `/products/${product.id}`,
    });
    toast.success('Review submitted');
  };

  const renderStars = (value: number, size = 16) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(value);
        return (
          <Star
            key={index}
            size={size}
            className={filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        );
      })}
    </div>
  );

  const wishlisted = product ? isInWishlist(product.id) : false;

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
        <div className="space-y-12">
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
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                {renderStars(averageRating, 18)}
                <span>
                  {reviews.length > 0
                    ? `${averageRating.toFixed(1)} (${reviews.length} review${reviews.length === 1 ? '' : 's'})`
                    : 'No ratings yet'}
                </span>
              </div>
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

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.stockQuantity === 0}
                  className="gap-2 w-full sm:w-auto"
                  size="lg"
                >
                  <ShoppingCart size={20} />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={() => toggleWishlist(product)}
                  variant="secondary"
                  className="gap-2 w-full sm:w-auto"
                  size="lg"
                >
                  <Heart size={18} className={wishlisted ? 'text-pink-600 fill-pink-600' : 'text-gray-600'} />
                  {wishlisted ? 'Saved' : 'Save to Wishlist'}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h2>
                <p className="text-sm text-gray-500 mt-1">Share your feedback with other shoppers.</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-bold text-gray-900">
                    {reviews.length ? averageRating.toFixed(1) : '0.0'}
                  </span>
                  {renderStars(averageRating, 18)}
                </div>
                <p className="text-sm text-gray-500">{reviews.length} total</p>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{review.userName}</p>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">{renderStars(review.rating)}</div>
                    {review.title && <p className="mt-2 font-semibold text-gray-800">{review.title}</p>}
                    {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-500">Be the first to review this product.</p>
            )}

            <div className="mt-6 border-t border-gray-100 pt-6">
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Your rating</p>
                    <div className="mt-2 flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const isSelected = value <= rating;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="p-1"
                            aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                          >
                            <Star
                              size={20}
                              className={isSelected ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      placeholder="Review title (optional)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      placeholder="Share details about your experience..."
                      className="min-h-[110px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button type="submit" disabled={!rating} className="gap-2">
                    Submit review
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-gray-600">
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link>{' '}
                  to leave a review.
                </p>
              )}
            </div>
          </div>

          {recommendations && recommendations.length > 0 && (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Recommended for you</h2>
                <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all products
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onAddToCart={(selected, quantity) => void addProductToCart(selected, quantity)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailPage;
