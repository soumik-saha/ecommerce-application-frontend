import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage: React.FC = () => (
  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900">Order Placed!</h1>
      <p className="mt-3 text-gray-600 max-w-sm mx-auto">
        Thank you for your purchase. Your order has been successfully placed and is being processed.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  </div>
);

export default OrderSuccessPage;
