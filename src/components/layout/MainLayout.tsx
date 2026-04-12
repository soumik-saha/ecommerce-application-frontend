import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { setCartItems } from '../../features/cart/cartSlice';
import { cartService } from '../../features/cart/cartService';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadCart = async () => {
      try {
        const cart = await cartService.getCart();
        if (!cancelled) {
          dispatch(setCartItems(cart.items));
        }
      } catch {
        if (!cancelled) {
          dispatch(setCartItems([]));
        }
      }
    };

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
