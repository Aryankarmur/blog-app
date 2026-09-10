import api from './api';

// Get dashboard statistics
export const getAdminStats = () => {
  return api.get('/admin/stats');
};

// Get all users (paginated)
export const getAdminUsers = (page = 1, limit = 20) => {
  return api.get(`/admin/users?page=${page}&limit=${limit}`);
};

// Update user role
export const updateUserRole = (userId, role) => {
  return api.put(`/admin/users/${userId}/role`, { role });
};

// Get all posts (paginated, filter by status)
export const getAdminPosts = (page = 1, limit = 20, status = '') => {
  const statusQuery = status ? `&status=${status}` : '';
  return api.get(`/admin/posts?page=${page}&limit=${limit}${statusQuery}`);
};

// Delete post (Admin override)
export const deleteAdminPost = (postId) => {
  return api.delete(`/admin/posts/${postId}`);
};

// Get all comments (paginated)
export const getAdminComments = (page = 1, limit = 20) => {
  return api.get(`/admin/comments?page=${page}&limit=${limit}`);
};

// Delete comment (Admin override)
export const deleteAdminComment = (commentId) => {
  return api.delete(`/admin/comments/${commentId}`);
};
