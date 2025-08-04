import axios from 'axios';

// This is the base URL for your server.
// It will be your Render URL in production and localhost in development.
// Notice we do NOT include /api or /api/v1 here.
export const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create a new Axios instance with the base URL
const apiClient = axios.create({
  baseURL: baseURL,
});

/**
 * This is an Axios interceptor. It's a special function that runs
 * BEFORE every single request you make with `apiClient`.
 * Its job is to automatically add the authentication token to the headers.
*/
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;