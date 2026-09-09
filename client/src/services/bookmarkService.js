import api from './api';

export const addBookmark = async (postId) => {
  const response = await api.post(`/bookmarks/${postId}`);
  return response.data;
};

export const removeBookmark = async (postId) => {
  const response = await api.delete(`/bookmarks/${postId}`);
  return response.data;
};

export const checkBookmark = async (postId) => {
  const response = await api.get(`/bookmarks/${postId}`);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/bookmarks');
  return response.data;
};
