import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let userA = await User.findOne({ email: 'testA@example.com' });
  if (!userA) userA = await User.create({ name: 'User A', email: 'testA@example.com', password: 'password123' });
  
  let userB = await User.findOne({ email: 'testB@example.com' });
  if (!userB) userB = await User.create({ name: 'User B', email: 'testB@example.com', password: 'password123' });

  const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const headersA = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` };
  const headersB = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` };

  let post = await Post.findOne();
  if (!post) post = await Post.create({ title: 'Test Post', content: 'Content', author: userA._id, category: 'Test' });
  
  const postId = post._id.toString();
  let commentId;

  console.log('--- TEST 1: Create comment ---');
  let res = await fetch(`${API_URL}/comments`, { method: 'POST', headers: headersA, body: JSON.stringify({ post: postId, content: 'Great article!' }) });
  let data = await res.json();
  console.log('Test 1 Passed:', res.status === 201, data.success);
  commentId = data.data._id;

  console.log('--- TEST 2: Get comments ---');
  res = await fetch(`${API_URL}/comments/post/${postId}`);
  data = await res.json();
  console.log('Test 2 Passed:', res.status === 200, data.success, data.data.length > 0);

  console.log('--- TEST 3: Create comment with invalid post ---');
  const invalidId = new mongoose.Types.ObjectId();
  res = await fetch(`${API_URL}/comments`, { method: 'POST', headers: headersA, body: JSON.stringify({ post: invalidId, content: 'Test' }) });
  console.log('Test 3 Passed:', res.status === 404);

  console.log('--- TEST 4: Empty comment ---');
  res = await fetch(`${API_URL}/comments`, { method: 'POST', headers: headersA, body: JSON.stringify({ post: postId, content: '   ' }) });
  console.log('Test 4 Passed:', res.status === 400);

  console.log('--- TEST 5: Missing authentication ---');
  res = await fetch(`${API_URL}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post: postId, content: 'Test' }) });
  console.log('Test 5 Passed:', res.status === 401);

  console.log('--- TEST 7: Delete another user\'s comment ---');
  res = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE', headers: headersB });
  console.log('Test 7 Passed:', res.status === 403);

  console.log('--- TEST 6: Delete own comment ---');
  res = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE', headers: headersA });
  console.log('Test 6 Passed:', res.status === 200);

  console.log('--- TEST 8: Delete nonexistent comment ---');
  res = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE', headers: headersA });
  console.log('Test 8 Passed:', res.status === 404);

  process.exit();
}

runTests();
