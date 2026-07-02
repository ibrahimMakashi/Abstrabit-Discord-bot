import { apiClient } from './client';

export const getCommandLogs = async (params) => {
  const { bustCache = false, ...query } = params;
  const response = await apiClient.get('/commands', {
    params: bustCache ? { ...query, _t: Date.now() } : query,
    headers: bustCache ? { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } : undefined,
  });
  return response.data;
};
