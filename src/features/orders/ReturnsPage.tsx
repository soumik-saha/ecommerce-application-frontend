import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { orderService } from './orderService';
import { returnService } from './returnService';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
};

const ReturnsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['returns'],
    queryFn: () => orderService.getMyOrders(0, 50),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-600">{parseError(error)}</p>
      </div>
    );
  }

  const orders = data?.content ?? [];
  const localReturns = returnService.getReturnRequests();
  const returnRequests = orders.filter((order) => order.returnStatus || localReturns[order.id]);
  const eligibleOrders = orders.filter(
    (order) => order.status === 'DELIVERED' && !(order.returnStatus || localReturns[order.id])
  );

  if (!returnRequests.length && !eligibleOrders.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <RotateCcw size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">No returns yet</h1>
        <p className="mt-2 text-gray-500">Delivered orders will appear here if they are eligible for returns.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
        <p className="text-sm text-gray-500 mt-1">Track your return requests and eligible orders.</p>
      </div>

      {returnRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Active return requests</h2>
          {returnRequests.map((order) => {
            const localReturn = localReturns[order.id];
            const returnStatus = order.returnStatus ?? localReturn?.status ?? 'REQUESTED';
            const returnRequestedAt = order.returnRequestedAt ?? localReturn?.requestedAt;
            return (
              <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">Requested on {formatDate(returnRequestedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[returnStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {returnStatus}
                    </span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {eligibleOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Eligible for return</h2>
          {eligibleOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Request return
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnsPage;
