import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

const ProductListPage = lazy(() => import('../features/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('../features/products/ProductDetailPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const CartPage = lazy(() => import('../features/cart/CartPage'));
const OrderSuccessPage = lazy(() => import('../features/orders/OrderSuccessPage'));
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../features/admin/AdminProducts'));
const AdminOrders = lazy(() => import('../features/admin/AdminOrders'));

const PageLoader = () => (
  <div className="mx-auto max-w-7xl px-4 py-8">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  </div>
);

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><ProductListPage /></Suspense>} />
      <Route path="/products/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
      <Route path="/cart" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}><CartPage /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/orders/success" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
        </AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute>
          <Suspense fallback={<PageLoader />}><AdminProducts /></Suspense>
        </AdminRoute>
      } />
      <Route path="/admin/orders" element={
        <AdminRoute>
          <Suspense fallback={<PageLoader />}><AdminOrders /></Suspense>
        </AdminRoute>
      } />
    </Route>
  </Routes>
);
