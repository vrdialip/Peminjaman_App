import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk handle error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ==================== AUTH API ====================
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

// ==================== PUBLIC API ====================
export const publicApi = {
    getOrganizations: () => api.get('/public/organizations'),
    getOrganization: (slug) => api.get(`/public/organizations/${slug}`),
    getItems: (slug, params = {}) => api.get(`/public/organizations/${slug}/items`, { params }),
    getLoanableItems: (slug, params = {}) => api.get(`/public/organizations/${slug}/items/loanable`, { params }),
    getItem: (slug, itemId) => api.get(`/public/organizations/${slug}/items/${itemId}`),
    getCategories: (slug) => api.get(`/public/organizations/${slug}/categories`),
    submitLoan: (slug, data) => api.post(`/public/organizations/${slug}/loans`, data),
    checkLoanStatus: (loanCode) => api.post('/public/loans/check-status', { loan_code: loanCode }),
    submitReturn: (data) => api.post('/public/loans/return', data),
};

// ==================== ADMIN MASTER API ====================
export const adminMasterApi = {
    dashboard: () => api.get('/admin-master/dashboard'),

    // Organizations
    getOrganizations: (params = {}) => api.get('/admin-master/organizations', { params }),
    createOrganization: (data) => api.post('/admin-master/organizations', data),
    getOrganization: (id) => api.get(`/admin-master/organizations/${id}`),
    updateOrganization: (id, data) => api.put(`/admin-master/organizations/${id}`, data),
    deleteOrganization: (id) => api.delete(`/admin-master/organizations/${id}`),

    // Admins
    getAdmins: (params = {}) => api.get('/admin-master/admins', { params }),
    createAdmin: (data) => api.post('/admin-master/admins', data),
    updateAdmin: (id, data) => api.put(`/admin-master/admins/${id}`, data),
    resetAdminPassword: (id, password) => api.put(`/admin-master/admins/${id}/reset-password`, { password }),
    toggleAdminStatus: (id) => api.put(`/admin-master/admins/${id}/toggle-status`),
    deleteAdmin: (id) => api.delete(`/admin-master/admins/${id}`),

    // Monitoring
    getAllItems: (params = {}) => api.get('/admin-master/items', { params }),
    getAllLoans: (params = {}) => api.get('/admin-master/loans', { params }),
    getAuditLogs: (params = {}) => api.get('/admin-master/audit-logs', { params }),
};

// ==================== ADMIN ORG API ====================
export const adminOrgApi = {
    dashboard: () => api.get('/admin-org/dashboard'),

    // Items
    getItems: (params = {}) => api.get('/admin-org/items', { params }),
    createItem: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/admin-org/items', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getItem: (id) => api.get(`/admin-org/items/${id}`),
    updateItem: (id, data) => {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post(`/admin-org/items/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteItem: (id) => api.delete(`/admin-org/items/${id}`),
    getCategories: () => api.get('/admin-org/categories'),

    // Loans
    getPendingLoans: (params = {}) => api.get('/admin-org/loans/pending', { params }),
    getLoan: (id) => api.get(`/admin-org/loans/${id}`),
    approveLoan: (id) => api.post(`/admin-org/loans/${id}/approve`),
    rejectLoan: (id, reason) => api.post(`/admin-org/loans/${id}/reject`, { reason }),

    // Returns
    getReturnPending: (params = {}) => api.get('/admin-org/returns/pending', { params }),
    completeReturn: (id, data) => api.post(`/admin-org/returns/${id}/complete`, data),

    // All Loans
    getAllLoans: (params = {}) => api.get('/admin-org/loans', { params }),

    // Reports
    getInventoryReport: () => api.get('/admin-org/reports/inventory'),
    getLoanReport: (month, year) => api.get('/admin-org/reports/loans', { params: { month, year } }),
};
