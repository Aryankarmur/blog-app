import mongoose from 'mongoose';
import Bookmark from '../models/Bookmark.js';
import Post from '../models/Post.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Add a bookmark
// @route   POST /api/bookmarks/:postId
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Cannot bookmark a draft post' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });
    if (existingBookmark) {
      return res.status(200).json({
        success: true,
        data: { bookmarked: true },
        message: 'Post already bookmarked',
      });
    }

    await Bookmark.create({ user: userId, post: postId });

    res.status(201).json({
      success: true,
      data: { bookmarked: true },
      message: 'Post bookmarked successfully',
    });
  } catch (error) {
    console.error('Error in addBookmark:', error.message);
    if (error.code === 11000) {
      // Duplicate key error from MongoDB compound index
      return res.status(200).json({
        success: true,
        data: { bookmarked: true },
        message: 'Post already bookmarked',
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:postId
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const bookmark = await Bookmark.findOneAndDelete({ user: userId, post: postId });

    res.status(200).json({
      success: true,
      data: { bookmarked: false },
      message: bookmark ? 'Bookmark removed' : 'Bookmark not found',
    });
  } catch (error) {
    console.error('Error in removeBookmark:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check bookmark status
// @route   GET /api/bookmarks/:postId
// @access  Private
export const checkBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const bookmark = await Bookmark.findOne({ user: userId, post: postId });

    res.status(200).json({
      success: true,
      data: { bookmarked: !!bookmark },
    });
  } catch (error) {
    console.error('Error in checkBookmark:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
export const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: '-password',
        },
      });

    // Filter out bookmarks where the post was deleted or is no longer published
    const validBookmarks = bookmarks.filter((b) => b.post && b.post.status === 'published');

    res.status(200).json({
      success: true,
      data: { bookmarks: validBookmarks },
    });
  } catch (error) {
    console.error('Error in getUserBookmarks:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
