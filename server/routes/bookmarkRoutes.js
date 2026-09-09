import express from 'express';
import {
  addBookmark,
  removeBookmark,
  checkBookmark,
  getUserBookmarks,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getUserBookmarks);
router
  .route('/:postId')
  .post(protect, addBookmark)
  .delete(protect, removeBookmark)
  .get(protect, checkBookmark);

export default router;
