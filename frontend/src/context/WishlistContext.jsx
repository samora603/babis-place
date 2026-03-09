import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    const { data } = await wishlistService.getWishlist();
    setWishlist(data.data || { products: [] });
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlist.products?.some(
      (p) => (p._id || p) === productId
    );
    if (isInWishlist) {
      const { data } = await wishlistService.removeFromWishlist(productId);
      setWishlist(data.data);
    } else {
      const { data } = await wishlistService.addToWishlist(productId);
      setWishlist(data.data);
    }
  };

  const isWishlisted = (productId) =>
    wishlist.products?.some((p) => (p._id || p) === productId) || false;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
