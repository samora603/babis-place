import api from './api';

export const productService = {
    getProducts: (params) => api.get('/products', { params }),
    getProduct: (idOrSlug) => api.get(`/products/${idOrSlug}`),
    getCategories: () => api.get('/categories'),
};
