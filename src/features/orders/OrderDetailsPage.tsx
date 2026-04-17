import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Order #{id}</h1>
      <p className="mt-2 text-sm text-gray-500">
        Order details view will be expanded in the next step.
      </p>
      <Link to="/orders" className="mt-6 inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Back to Orders
      </Link>
    </div>
  );
};

export default OrderDetailsPage;
