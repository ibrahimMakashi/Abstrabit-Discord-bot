import { apiClient } from './client';

export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};

export const getAnalytics = async () => {
  const response = await apiClient.get('/dashboard/analytics');
  return response.data;
};

export const getSystemStatus = async () => {
  const response = await apiClient.get('/dashboard/status');
  return response.data;
};
