import { apiClient } from './client';

export const updateProfile = async (payload) => {
  const response = await apiClient.patch('/profile', payload);
  return response.data;
};

export const uploadProfileAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/profile/avatar', formData);

  return response.data;
};

export const deleteProfileAvatar = async () => {
  const response = await apiClient.delete('/profile/avatar');
  return response.data;
};
