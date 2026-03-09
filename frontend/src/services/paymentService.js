import api from './api';

export const paymentService = {
    initiateStkPush: (orderId, phone) => api.post('/payment/stk-push', { orderId, phone }),
    checkStatus: (orderId) => api.get(`/payment/status/${orderId}`),
};
