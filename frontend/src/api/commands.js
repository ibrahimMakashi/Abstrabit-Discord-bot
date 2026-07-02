import { apiClient } from './client';

export const getCommandLogs = async (params) => {
  const response = await apiClient.get('/commands', { params });
  return response.data;
};
