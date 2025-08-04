import { baseURL } from './apiClient'; // Import the single source of truth for the URL

/**
 * A central wrapper for the native fetch API.
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/teacher/my-courses').
 * @param {object} options - Optional fetch options (method, body, custom headers).
 * @returns {Promise<any>} - A promise that resolves with the JSON data.
 */
export const fetchClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An error occurred during the fetch operation.');
  }

  return response.json();
};