import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getTags,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createPost).get(getPosts);
router.route('/tags').get(getTags);
router.route('/:id').get(getPostById).put(protect, updatePost).delete(protect, deletePost);

export default router;
