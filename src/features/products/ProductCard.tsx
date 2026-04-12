import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import type { ProductResponse } from '../../types';
import { Button } from '../../components/ui/Button';

interface Props {
  product: ProductResponse;
  onAddToCart?: (product: ProductResponse, quantity: number) => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

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
        {product.stockQuantity > 0 && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded p-1 text-gray-600 hover:bg-gray-100"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus size={14} />
            </button>
            <span className="min-w-6 text-center text-sm font-medium text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
              className="rounded p-1 text-gray-600 hover:bg-gray-100"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
        <Button
          onClick={() => onAddToCart?.(product, quantity)}
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
