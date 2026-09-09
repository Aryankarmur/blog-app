import mongoose from 'mongoose';
import Post from '../models/Post.js';

// Validate ObjectId helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape regex characters helper
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Public (for now)
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;
    const author = req.user._id;

    const post = new Post({
      title,
      content,
      excerpt,
      coverImage,
      author,
      category,
      tags,
      status,
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      data: savedPost,
    });
  } catch (error) {
    console.error('Error in createPost:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all posts (with search, filter, and pagination)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const { page, limit, search, category, tag } = req.query;

    // 1. Pagination setup
    let pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

    let limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 50) limitNum = 50;

    const skip = (pageNum - 1) * limitNum;

    // 2. Query construction
    const query = {};

    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { content: { $regex: escapedSearch, $options: 'i' } },
        { excerpt: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (category) {
      // Use regex for case-insensitive exact match
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (tag) {
      // Use regex for case-insensitive exact match within the array
      query.tags = { $regex: `^${tag}$`, $options: 'i' };
    }

    // 3. Execute queries in parallel
    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('author', '-password'),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPosts,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error in getPosts:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get unique tags from published posts
// @route   GET /api/posts/tags
// @access  Public
export const getTags = async (req, res) => {
  try {
    const tags = await Post.distinct('tags', { status: 'published' });
    // Filter out empty strings/nulls and sort alphabetically
    const cleanTags = tags.filter(tag => tag && tag.trim() !== '').sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    res.status(200).json({
      success: true,
      data: { tags: cleanTags },
    });
  } catch (error) {
    console.error('Error in getTags:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id).populate('author', '-password');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error in getPostById:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Public (for now)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    let post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    // Update only allowed fields
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) post.status = status;

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error in updatePost:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Public (for now)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne(); // Use deleteOne on the document instance

    res.status(200).json({
      success: true,
      data: {}, // Return empty object for deleted resource
    });
  } catch (error) {
    console.error('Error in deletePost:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
