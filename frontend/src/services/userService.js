import api from './api';

export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (body) => api.put('/users/profile', body),
    addAddress: (address) => api.post('/users/addresses', address),
    updateAddress: (id, address) => api.put(`/users/addresses/${id}`, address),
    deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};
