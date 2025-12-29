import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:4002',
  withCredentials: true,  // 🔥 REQUIRED for cookies
});

export default api;