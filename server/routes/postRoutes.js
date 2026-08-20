import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { createComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createPost).get(getPosts);
router.route('/:id').get(getPostById).put(protect, updatePost).delete(protect, deletePost);
router.route('/:postId/comments').post(protect, createComment).get(getComments);

export default router;
