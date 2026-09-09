import api from './api';

export const getPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getTags = async () => {
  const response = await api.get('/posts/tags');
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const updatePost = async (id, postData) => {
  const response = await api.put(`/posts/${id}`, postData);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

// Comment APIs
export const getCommentsByPost = async (postId) => {
  const response = await api.get(`/comments/post/${postId}`);
  return response.data;
};

export const createComment = async (postId, content) => {
  const response = await api.post('/comments', { post: postId, content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
