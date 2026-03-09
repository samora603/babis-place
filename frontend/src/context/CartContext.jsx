import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '@/services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.data || { items: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, variation = null) => {
    const { data } = await cartService.addToCart({ productId, quantity, variation });
    setCart(data.data);
    toast.success('Added to cart');
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartService.updateCartItem(itemId, quantity);
    setCart(data.data);
  };

  const removeItem = async (itemId) => {
    const { data } = await cartService.removeFromCart(itemId);
    setCart(data.data);
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart({ items: [] });
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    const modifier = item.variation?.priceModifier || 0;
    return sum + (price + modifier) * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, subtotal, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
