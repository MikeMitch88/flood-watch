import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods
export const authAPI = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    getCurrentUser: () => api.get('/auth/me'),
};

export const reportsAPI = {
    getAll: (params?: any) => api.get('/reports/', { params }),
    getPending: () => api.get('/reports/pending'),
    getById: (id: string) => api.get(`/reports/${id}`),
    verify: (id: string) => api.post(`/reports/${id}/verify`),
    reject: (id: string, reason: string) =>
        api.post(`/reports/${id}/reject`, { reason }),
};

export const incidentsAPI = {
    getAll: (params?: any) => api.get('/incidents/', { params }),
    getActive: () => api.get('/incidents/active'),
    getForMap: (bounds: any) => api.get('/incidents/map', { params: bounds }),
    getById: (id: string) => api.get(`/incidents/${id}`),
    updateStatus: (id: string, status: string) =>
        api.put(`/incidents/${id}/status`, { status }),
    resolve: (id: string) => api.post(`/incidents/${id}/resolve`),
};

export const alertsAPI = {
    getAll: (params?: any) => api.get('/alerts/', { params }),
    getById: (id: string) => api.get(`/alerts/${id}`),
    create: (data: any) => api.post('/alerts/', data),
    createForIncident: (incidentId: string, severity?: string) =>
        api.post(`/alerts/incident/${incidentId}/alert`, { severity }),
    retry: (id: string) => api.post(`/alerts/${id}/retry`),
    getForIncident: (incidentId: string) =>
        api.get(`/alerts/incident/${incidentId}/alerts`),
};

export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getReportsByDate: (days: number = 30) =>
        api.get('/analytics/reports-by-date', { params: { days } }),
    getSeverityBreakdown: () => api.get('/analytics/severity-breakdown'),
};

export const usersAPI = {
    getAll: (params?: any) => api.get('/users/', { params }),
    getById: (id: string) => api.get(`/users/${id}`),
    updateCredibility: (id: string, adjustment: number) =>
        api.put(`/users/${id}/credibility`, { adjustment }),
};

export default api;
