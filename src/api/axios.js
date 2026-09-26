import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-manager-api-shi8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-manager-api-shi8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;