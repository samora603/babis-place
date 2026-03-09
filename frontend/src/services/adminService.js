import api from './api';

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, body) => api.put(`/admin/orders/${id}/status`, body),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),

    // Products (admin)
    createProduct: (body) => api.post('/products', body),
    updateProduct: (id, body) => api.put(`/products/${id}`, body),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

    // Categories
    createCategory: (body) => api.post('/categories', body),
    updateCategory: (id, body) => api.put(`/categories/${id}`, body),
    deleteCategory: (id) => api.delete(`/categories/${id}`),

    // Inventory
    getInventory: (params) => api.get('/inventory', { params }),
    getLowStock: () => api.get('/inventory/low-stock'),
    updateStock: (productId, body) => api.put(`/inventory/${productId}/stock`, body),

    // Pickup Locations
    getPickupLocations: () => api.get('/pickup-locations'),
    addPickupLocation: (body) => api.post('/pickup-locations', body),
    updatePickupLocation: (id, body) => api.put(`/pickup-locations/${id}`, body),
    deletePickupLocation: (id) => api.delete(`/pickup-locations/${id}`),
};
