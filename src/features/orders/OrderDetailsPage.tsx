import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PackageOpen } from 'lucide-react';
import { orderService } from './orderService';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';
import { useNotifications } from '../../hooks/useNotifications';
import type { Order, OrderItem } from '../../types';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const defaultTimeline = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const getFallbackImage = (name: string) => `https://placehold.co/200x200?text=${encodeURIComponent(name)}`;

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
};

const formatAddress = (order: Order) => {
  const address = order.shippingAddress;
  if (!address) return 'Not provided';
  const parts = [address.street, address.city, address.state, address.zipcode, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not provided';
};

const normalizeItems = (items?: OrderItem[]) => items ?? [];

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const orderId = Number(id);
  const hasValidId = Number.isFinite(orderId) && orderId > 0;
  const [showReturnForm, setShowReturnForm] = React.useState(false);
  const [returnReason, setReturnReason] = React.useState('');
  const [returnComment, setReturnComment] = React.useState('');
  const [returnSubmitted, setReturnSubmitted] = React.useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: hasValidId,
  });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-600">{parseError(error)}</p>
        <Button onClick={() => navigate('/orders')} variant="ghost" className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Button onClick={() => navigate('/orders')} variant="ghost" className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  const items = normalizeItems(order.items);
  const timeline = order.statusHistory?.length
    ? order.statusHistory.map((entry) => ({ status: entry.status, timestamp: entry.timestamp }))
    : defaultTimeline.map((status) => ({ status, timestamp: undefined }));
  const activeIndex = timeline.findIndex((step) => step.status === order.status);
  const currentIndex = activeIndex >= 0 ? activeIndex : timeline.length - 1;
  const paymentStatus = order.paymentStatus ?? 'Not available';
  const paymentMethod = order.paymentMethod ?? 'Not specified';
  const returnStatus = order.returnStatus ?? (returnSubmitted ? 'REQUESTED' : undefined);

  const handleReturnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!returnReason) {
      return;
    }
    setReturnSubmitted(true);
    setShowReturnForm(false);
    setReturnReason('');
    setReturnComment('');
    if (order) {
      addNotification({
        title: 'Return request submitted',
        message: `Your return request for order #${order.id} has been received.`,
        type: 'return',
        link: `/orders/${order.id}`,
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} /> Back to orders
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Order total</p>
          <p className="text-2xl font-bold text-gray-900">${order.totalAmount?.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <PackageOpen size={48} className="mb-3 text-gray-300" />
                <p>No items found in this order.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.price}-${item.quantity}`} className="flex items-center gap-4 rounded-lg border border-gray-100 p-3">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            if (target.dataset.fallbackApplied === 'true') {
                              return;
                            }
                            target.dataset.fallbackApplied = 'true';
                            target.src = getFallbackImage(item.productName);
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            <div className="mt-4 space-y-3">
              {timeline.map((step, index) => {
                const isActive = index <= currentIndex;
                return (
                  <div key={step.status} className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {formatStatus(step.status)}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400">{formatDate(step.timestamp)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.status === 'DELIVERED' && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Returns & Refunds</h2>
                  <p className="text-sm text-gray-500">Need to return this order? Submit a request.</p>
                </div>
                {!returnStatus && (
                  <Button variant="secondary" onClick={() => setShowReturnForm((prev) => !prev)}>
                    Request Return
                  </Button>
                )}
              </div>

              {returnStatus && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Return status:</span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {formatStatus(returnStatus)}
                  </span>
                  <span className="text-gray-500">
                    {order.returnRequestedAt ? `Requested on ${formatDate(order.returnRequestedAt)}` : 'Request received'}
                  </span>
                </div>
              )}

              {showReturnForm && !returnStatus && (
                <form onSubmit={handleReturnSubmit} className="mt-4 space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="returnReason">
                      Reason for return
                    </label>
                    <select
                      id="returnReason"
                      value={returnReason}
                      onChange={(event) => setReturnReason(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a reason</option>
                      <option value="DAMAGED">Item arrived damaged</option>
                      <option value="WRONG_ITEM">Wrong item received</option>
                      <option value="NOT_AS_DESCRIBED">Not as described</option>
                      <option value="CHANGE_OF_MIND">Change of mind</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="returnComment">
                      Comment (optional)
                    </label>
                    <textarea
                      id="returnComment"
                      value={returnComment}
                      onChange={(event) => setReturnComment(event.target.value)}
                      className="min-h-[96px] w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide any additional details to help us process your return."
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={!returnReason}>
                      Submit return request
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowReturnForm(false)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${order.totalAmount?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            <p className="mt-3 text-sm text-gray-600">{formatAddress(order)}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium text-gray-900">{paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-gray-900">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
