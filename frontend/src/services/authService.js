import api from './api';

export const authService = {
    requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
    verifyOTP: (phone, code, purpose) => api.post('/auth/verify-otp', { phone, code, purpose }),
    adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};
