import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth Header Helper
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Error Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    payAccessFee: (data) => api.post('/auth/pay-access-fee', data),
    // Admin User Management
    getAllUsers: () => api.get('/auth/users'),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`)
};

export const cattleApi = {
    getAll: () => api.get('/cattle'),
    getById: (id) => api.get(`/cattle/${id}`),
    create: (data) => api.post('/cattle', data),
    update: (id, data) => api.put(`/cattle/${id}`, data),
    delete: (id) => api.delete(`/cattle/${id}`)
};

export const milkApi = {
    getAll: () => api.get('/milk'),
    getSummary: () => api.get('/milk/summary'),
    create: (data) => api.post('/milk', data)
};

export const healthApi = {
    getSummary: () => api.get('/health/summary'),
    getAlerts: () => api.get('/health/alerts'),
    getHistory: () => api.get('/health/history'),
    getHistoryByCattle: (cattleId) => api.get(`/health/history/${cattleId}`),
    createRecord: (data) => api.post('/health/history', data)
};

export const marketplaceApi = {
    getProducts: () => api.get('/marketplace/products'),
    getProductById: (id) => api.get(`/marketplace/products/${id}`),
    createProduct: (data) => api.post('/marketplace/products', data),
    updateProduct: (id, data) => api.put(`/marketplace/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/marketplace/products/${id}`),
    createOrder: (data) => api.post('/marketplace/orders', data),
    getOrders: () => api.get('/marketplace/orders'),
    getOrderStatus: (id) => api.get(`/marketplace/orders/${id}/status`),
    uploadImage: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const dashboardApi = {
    getStats: () => api.get('/dashboard/stats')
};

export default api;
