import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

let csrfToken = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error?.response?.data || error),
);

export const setCsrfToken = (token) => {
  csrfToken = token;
};
