import express from 'express';
import { protect, authorizeAdmin } from '../middleware/authMiddleware.js';
import {
  getStats,
  getUsers,
  updateUserRole,
  getPosts,
  deletePost,
  getComments,
  deleteComment,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorizeAdmin);

// Dashboard stats
router.get('/stats', getStats);

// User management
router.route('/users').get(getUsers);
router.route('/users/:id/role').put(updateUserRole);

// Post management
router.route('/posts').get(getPosts);
router.route('/posts/:id').delete(deletePost);

// Comment management
router.route('/comments').get(getComments);
router.route('/comments/:id').delete(deleteComment);

export default router;
