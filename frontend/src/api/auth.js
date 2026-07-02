import { apiClient } from './client';

export const registerAdmin = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export const loginAdmin = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

export const refreshSession = async () => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};

export const logoutAdmin = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getCurrentAdmin = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const getCsrfToken = async () => {
  const response = await apiClient.get('/csrf-token');
  return response.data;
};
