import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { post: postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ success: false, message: 'Post ID and content are required' });
    }

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content,
    });

    const savedComment = await comment.save();
    
    // Populate the author before returning
    await savedComment.populate('author', '_id name profileImage');

    res.status(201).json({
      success: true,
      data: savedComment,
    });
  } catch (error) {
    console.error('Error in createComment:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('author', '_id name profileImage');

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error in getCommentsByPost:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID format' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error in deleteComment:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
