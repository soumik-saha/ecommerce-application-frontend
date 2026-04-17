import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { orderService } from './orderService';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';

const PAGE_SIZE = 8;

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const OrdersPage: React.FC = () => {
  const [page, setPage] = React.useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-orders', page],
    queryFn: () => orderService.getMyOrders(page, PAGE_SIZE),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track your recent purchases</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 mb-6">
          {parseError(error)}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-gray-500">
          <ShoppingBag size={56} className="mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
          <p className="mt-1 text-sm">Your placed orders will appear here.</p>
          <Link to="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data.content.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">Order #{order.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${order.totalAmount?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-sm text-gray-500">{order.items?.length ?? 0} item(s)</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={data.first}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {data.number + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(data.totalPages - 1, current + 1))}
                disabled={data.last}
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

export default OrdersPage;
