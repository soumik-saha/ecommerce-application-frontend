import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { ProductResponse } from '../../types';
import { Button } from '../../components/ui/Button';

interface Props {
  product: ProductResponse;
  onAddToCart?: (product: ProductResponse) => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`} className="flex-1">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/300x300?text=${encodeURIComponent(product.name)}`;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-4xl">
              🛍️
            </div>
          )}
        </div>
        <div className="p-4">
          {product.category && (
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{product.category}</span>
          )}
          <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <p className="mt-2 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          onClick={() => onAddToCart?.(product)}
          size="sm"
          className="w-full gap-2"
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart size={16} />
          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
