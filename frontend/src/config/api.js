import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create multipart form data instance for file uploads
const apiMultipart = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export { api, apiMultipart, API_BASE_URL };