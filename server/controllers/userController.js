import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateCurrentUser = async (req, res) => {
  try {
    // Only extract allowed fields
    const { name, bio, profileImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateCurrentUser:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:id
// @access  Public
export const getPublicUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    // Return only public fields
    const user = await User.findById(id).select('_id name profileImage bio createdAt');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get published posts for the user
    const posts = await Post.find({ author: id, status: 'published' })
      .select('_id title excerpt coverImage category tags createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
      },
    });
  } catch (error) {
    console.error('Error in getPublicUserProfile:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
