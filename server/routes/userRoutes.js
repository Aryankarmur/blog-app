import express from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getPublicUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes for current user profile
router.route('/me').get(protect, getCurrentUser).put(protect, updateCurrentUser);

// Public route for any user profile
router.route('/:id').get(getPublicUserProfile);

export default router;
