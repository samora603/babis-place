import api from './api';

export const cartService = {
    getCart: () => api.get('/cart'),
    addToCart: (body) => api.post('/cart', body),
    updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
    clearCart: () => api.delete('/cart'),
};
