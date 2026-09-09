import api from './api';

export const getPublicUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};
