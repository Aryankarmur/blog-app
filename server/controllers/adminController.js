import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const [users, posts, publishedPosts, draftPosts, comments, bookmarks] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Bookmark.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        posts,
        publishedPosts,
        draftPosts,
        comments,
        bookmarks,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('_id name email role profileImage bio createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent self-demotion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    console.error('Error updating user role:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select('title category status createdAt updatedAt author')
      .populate('author', 'name email profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin posts:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching posts' });
  }
};

// @desc    Delete post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Clean up related comments and bookmarks
    await Comment.deleteMany({ post: post._id });
    await Bookmark.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    console.error('Error deleting admin post:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting post' });
  }
};

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.postId) {
      query.post = req.query.postId;
    }

    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('author', 'name email profileImage')
      .populate('post', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching comments' });
  }
};

// @desc    Delete comment (Admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    console.error('Error deleting admin comment:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting comment' });
  }
};
