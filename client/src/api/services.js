import api from './axios';

/* ─── Auth ─────────────────────────────────────────── */
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

/* ─── Menu ─────────────────────────────────────────── */
export const menuService = {
    getItems: (params) => api.get('/menu', { params }),
    getItem: (id) => api.get(`/menu/${id}`)
};

/* ─── Categories ───────────────────────────────────── */
export const categoryService = {
    getAll: () => api.get('/categories')
};

/* ─── Orders ───────────────────────────────────────── */
export const orderService = {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getOne: (id) => api.get(`/orders/${id}`)
};

/* ─── Admin ────────────────────────────────────────── */
export const adminService = {
    // Stats
    getStats: () => api.get('/admin/stats'),
    // Menu CRUD
    getMenu: () => api.get('/admin/menu'),
    createItem: (data) => api.post('/admin/menu', data),
    updateItem: (id, data) => api.put(`/admin/menu/${id}`, data),
    deleteItem: (id) => api.delete(`/admin/menu/${id}`),
    // Category CRUD
    createCategory: (data) => api.post('/admin/categories', data),
    updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
    // Orders
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}`, { status })
};
