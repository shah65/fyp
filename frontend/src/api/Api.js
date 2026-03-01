import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4002',
  withCredentials: true,  // 🔥 REQUIRED for cookies
});

// Project related methods
api.getProjectDetails = (projectId) => {
  return api.get(`/teacher/project/${projectId}/details`);
};

// Update project status
api.updateProjectStatus = (projectId, data) => {
  return api.patch(`/teacher/project/${projectId}/status`, data);
};

// Add feedback to project
api.addProjectFeedback = (projectId, comment) => {
  return api.post(`/teacher/project/${projectId}/feedback`, { comment });
};

export default api;