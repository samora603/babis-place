import api from './api';

export const orderService = {
    createOrder: (body) => api.post('/orders', body),
    getMyOrders: (params) => api.get('/orders', { params }),
    getOrder: (id) => api.get(`/orders/${id}`),
    cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};
