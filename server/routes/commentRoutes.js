import express from 'express';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createComment);
router.route('/post/:postId').get(getCommentsByPost);
router.route('/:id').delete(protect, deleteComment);

export default router;
