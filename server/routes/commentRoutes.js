import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:id').delete(protect, deleteComment);

export default router;
