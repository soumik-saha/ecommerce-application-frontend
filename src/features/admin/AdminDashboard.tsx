import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Products', icon: Package, color: 'bg-blue-500', link: '/admin/products' },
  { label: 'Total Orders', icon: ShoppingBag, color: 'bg-green-500', link: '/admin/orders' },
  { label: 'Total Users', icon: Users, color: 'bg-purple-500', link: '#' },
  { label: 'Revenue', icon: TrendingUp, color: 'bg-orange-500', link: '#' },
];

const AdminDashboard: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-500">Manage your store</p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, icon: Icon, color, link }) => (
        <Link
          key={label}
          to={link}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`inline-flex rounded-lg p-3 ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">{label}</h3>
          <p className="mt-1 text-sm text-gray-500">Manage {label.toLowerCase()}</p>
        </Link>
      ))}
    </div>

    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Link to="/admin/products" className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <Package size={20} className="text-blue-600" />
            <span className="font-medium text-gray-700">Manage Products</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <ShoppingBag size={20} className="text-green-600" />
            <span className="font-medium text-gray-700">View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
