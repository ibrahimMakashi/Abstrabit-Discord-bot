import { apiClient } from './client';

export const getDashboardSummary = async ({ bustCache = false } = {}) => {
  const response = await apiClient.get('/dashboard/summary', {
    params: bustCache ? { _t: Date.now() } : undefined,
    headers: bustCache ? { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } : undefined,
  });
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
