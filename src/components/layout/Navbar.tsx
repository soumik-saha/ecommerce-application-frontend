import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Search, Package, Heart, Bell, RotateCcw } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { clearCart } from '../../features/cart/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../app/hooks';
import { useWishlist } from '../../hooks/useWishlist';
import { useNotifications } from '../../hooks/useNotifications';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { items: wishlistItems, clearAll: clearWishlist } = useWishlist();
  const { unreadCount, clearAll: clearNotifications } = useNotifications();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    clearWishlist();
    clearNotifications();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0 text-xl font-bold text-blue-600">
            ShopApp
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-blue-600">
                  <Heart size={22} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs text-white font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" className="relative p-2 text-gray-700 hover:text-blue-600">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user?.email}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Bell size={16} /> Notifications
                    </Link>
                    <Link
                      to="/returns"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <RotateCcw size={16} /> Returns & Refunds
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
