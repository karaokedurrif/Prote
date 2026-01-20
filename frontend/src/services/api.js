/**
 * Cliente API
 * Configuración de Axios para comunicación con el backend
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones - añadir token
apiClient.interceptors.request.use(
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

// Interceptor de respuestas - manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      if (status === 401) {
        // No autorizado - limpiar token y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (status === 403) {
        toast.error('No tienes permisos para realizar esta acción');
      } else if (status === 404) {
        toast.error('Recurso no encontrado');
      } else if (status >= 500) {
        toast.error('Error del servidor. Inténtalo más tarde.');
      } else {
        toast.error(data.error || 'Ha ocurrido un error');
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      toast.error('No se pudo conectar con el servidor');
    } else {
      // Error al configurar la petición
      toast.error('Error en la petición');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Servicios específicos

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  refresh: () => apiClient.post('/auth/refresh'),
};

export const newsAPI = {
  getAll: (params) => apiClient.get('/public/news', { params }),
  getBySlug: (slug) => apiClient.get(`/public/news/${slug}`),
};

export const announcementsAPI = {
  getAll: (params) => apiClient.get('/public/announcements', { params }),
};

export const volunteersAPI = {
  getAll: (params) => apiClient.get('/volunteers', { params }),
  getById: (id) => apiClient.get(`/volunteers/${id}`),
  create: (data) => apiClient.post('/volunteers', data),
  update: (id, data) => apiClient.put(`/volunteers/${id}`, data),
  getHours: (id) => apiClient.get(`/volunteers/${id}/hours`),
};

export const eventsAPI = {
  getAll: (params) => apiClient.get('/events', { params }),
  create: (data) => apiClient.post('/events', data),
  assignVolunteer: (eventId, data) => apiClient.post(`/events/${eventId}/volunteers`, data),
  updateAssignment: (eventId, volunteerId, data) => 
    apiClient.put(`/events/${eventId}/volunteers/${volunteerId}`, data),
};

export const inventoryAPI = {
  getAll: (params) => apiClient.get('/inventory', { params }),
  create: (data) => apiClient.post('/inventory', data),
  update: (id, data) => apiClient.put(`/inventory/${id}`, data),
  getLowStock: () => apiClient.get('/inventory/low-stock'),
  getMaintenance: () => apiClient.get('/inventory/maintenance'),
};

export const financeAPI = {
  getInvoices: (params) => apiClient.get('/finance/invoices', { params }),
  createInvoice: (data) => apiClient.post('/finance/invoices', data),
  getSummary: (params) => apiClient.get('/finance/summary', { params }),
  export: (params) => apiClient.get('/finance/export', { params, responseType: 'blob' }),
};

export const grantsAPI = {
  getAll: (params) => apiClient.get('/grants', { params }),
  create: (data) => apiClient.post('/grants', data),
  apply: (id) => apiClient.put(`/grants/${id}/apply`),
  getAlerts: () => apiClient.get('/grants/alerts'),
};

export const meshAPI = {
  getPositions: (params) => apiClient.get('/mesh/positions', { params }),
  getTrack: (nodeId, params) => apiClient.get(`/mesh/positions/${nodeId}/track`, { params }),
  getNodes: () => apiClient.get('/mesh/nodes'),
};

export const weatherAPI = {
  getCurrent: (params) => apiClient.get('/weather/current', { params }),
  getHistory: (params) => apiClient.get('/weather/history', { params }),
  getAlerts: () => apiClient.get('/weather/alerts'),
};

export const transportAPI = {
  getAll: (params) => apiClient.get('/transport', { params }),
  create: (data) => apiClient.post('/transport', data),
  update: (id, data) => apiClient.put(`/transport/${id}`, data),
};

export const riskMapAPI = {
  getLayers: (params) => apiClient.get('/risk-map/layers', { params }),
  createLayer: (data) => apiClient.post('/risk-map/layers', data),
  updateLayer: (id, data) => apiClient.put(`/risk-map/layers/${id}`, data),
};
