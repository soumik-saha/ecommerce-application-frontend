import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import { cartService } from '../cart/cartService';
import { orderService } from '../orders/orderService';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCartItems, clearCart } from '../cart/cartSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';
import { useNotifications } from '../../hooks/useNotifications';

const PaymentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = React.useState<'CARD' | 'WALLET' | 'CASH'>('CARD');
  const [cardholderName, setCardholderName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [placingOrder, setPlacingOrder] = React.useState(false);

  const { isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await cartService.getCart();
      dispatch(setCartItems(cart.items));
      return cart;
    },
  });

  const cardFieldsValid = Boolean(cardholderName.trim() && cardNumber.trim() && expiry.trim() && cvv.trim());
  const isFormValid = paymentMethod !== 'CARD' || cardFieldsValid;

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      const order = await orderService.placeOrder();
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      addNotification({
        title: 'Payment confirmed',
        message: `Your payment was successful and order #${order.id} is now processing.`,
        type: 'payment',
        link: `/orders/${order.id}`,
      });
      navigate('/orders/success');
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-600">{parseError(error)}</p>
        <Button onClick={() => navigate('/cart')} variant="ghost" className="mt-4">
          Back to cart
        </Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add items to your cart before proceeding to payment.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Review your order and complete payment.</p>
        </div>
        <Link to="/cart" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                />
                <CreditCard size={18} />
                <span className="text-sm font-medium text-gray-700">Credit or debit card</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WALLET"
                  checked={paymentMethod === 'WALLET'}
                  onChange={() => setPaymentMethod('WALLET')}
                />
                <Wallet size={18} />
                <span className="text-sm font-medium text-gray-700">Digital wallet</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                />
                <ShieldCheck size={18} />
                <span className="text-sm font-medium text-gray-700">Cash on delivery</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Card details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Input
                  label="Cardholder name"
                  placeholder="Jane Doe"
                  value={cardholderName}
                  onChange={(event) => setCardholderName(event.target.value)}
                />
                <Input
                  label="Card number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod !== 'CARD' && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Payment instructions</h2>
              <p className="mt-3 text-sm text-gray-600">
                {paymentMethod === 'WALLET'
                  ? 'You will be redirected to your wallet provider after confirming the order.'
                  : 'You can pay with cash when your order is delivered to your address.'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="truncate">{item.productName} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-semibold text-gray-900">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            loading={placingOrder}
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            Pay & Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
