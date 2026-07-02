import { apiClient } from './client';

export const getSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

export const getDiscordInvite = async () => {
  const response = await apiClient.get('/settings/discord-invite');
  return response.data;
};

export const updateSettings = async (payload) => {
  const response = await apiClient.put('/settings', payload);
  return response.data;
};
