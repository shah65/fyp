// frontend/src/api/Api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4002',
  withCredentials: true,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Always add token to Authorization header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      withCredentials: config.withCredentials
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error Response:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message
    });

    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/teacherlogin')) {

        localStorage.removeItem('token');
        localStorage.removeItem('userRole');

        const requestedUrl = error.config?.url || '';
        if (requestedUrl.includes('/teacher/')) {
          window.location.href = '/teacherlogin';
        } else {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Project related methods
api.getProjectDetails = (projectId) => {
  return api.get(`/teacher/project/${projectId}/details`);
};

api.updateProjectStatus = (projectId, data) => {
  return api.patch(`/teacher/project/${projectId}/status`, data);
};

api.addProjectFeedback = (projectId, comment) => {
  return api.post(`/teacher/project/${projectId}/feedback`, { comment });
};

export default api;