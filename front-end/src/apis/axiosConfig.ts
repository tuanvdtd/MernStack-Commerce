import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3055',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Include cookies for authentication
  timeout: 1000 * 60 * 10, // 10 minute timeout
});

export default api;